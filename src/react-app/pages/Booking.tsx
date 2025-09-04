import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext-simple";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Header from "@/react-app/components/Header";
import { createFirestoreBooking, getVenues, checkVenueAvailability } from "@/react-app/services/firestoreDatabase";
import type { FirestoreBooking } from "@/react-app/services/firestoreDatabase";

export default function Booking() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Array<{
    id: string;
    name: string;
    location: string;
    capacity: number;
    description?: string;
    amenities?: string[];
    is_active: boolean;
    created_at: any;
    updated_at: any;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Debug logs
  console.log('Booking: Component rendered', { user, isPending, venues, loading });

  const [formData, setFormData] = useState<Omit<FirestoreBooking, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>>({
    company_name: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    venue_id: "",
    event_date: "",
    start_time: "",
    end_time: "",
    event_title: "",
    event_description: "",
    is_public: false,
    is_free: true,
    requires_registration: false,
    expected_attendees: undefined,
    contract_info: "",
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        contact_email: user.email || "",
        contact_name: user.displayName || "",
      }));
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const venuesData = await getVenues();
      setVenues(venuesData);
    } catch (error) {
      console.error("Error fetching venues:", error);
      setError("Erro ao carregar os locais disponíveis");
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      console.log('=== SUBMITTING BOOKING ===');
      console.log('User object:', user);
      console.log('User UID:', user?.uid);
      console.log('Form data:', formData);

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Check venue availability
      const isAvailable = await checkVenueAvailability(
        formData.venue_id,
        formData.event_date,
        formData.start_time,
        formData.end_time
      );

      if (!isAvailable) {
        throw new Error("Local não disponível no horário solicitado");
      }

      // Create booking in Firestore Database
      const bookingData: Omit<FirestoreBooking, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.uid,
        status: 'pending',
        ...formData
      };

      console.log('Final booking data:', bookingData);

      await createFirestoreBooking(bookingData);

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Agendamento Enviado com Sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu pedido de agendamento foi enviado e está aguardando aprovação. 
              Você receberá um email com a resposta em breve.
            </p>
            <button
              onClick={() => navigate("/my-bookings")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Meus Agendamentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Agendar Evento</h1>
          <p className="text-gray-600 mt-2">
            Preencha o formulário abaixo para solicitar o agendamento do seu evento
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações da Empresa/Organização
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa/Organização *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Contato *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações do Evento
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  name="event_title"
                  value={formData.event_title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Evento
                </label>
                <textarea
                  name="event_description"
                  value={formData.event_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Término *
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Esperado de Participantes
                </label>
                <input
                  type="number"
                  name="expected_attendees"
                  value={formData.expected_attendees || ""}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Venue Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Seleção do Local
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum local disponível no momento.</p>
                  <p className="text-gray-400 text-sm mt-2">Entre em contato com a administração para mais informações.</p>
                </div>
              ) : (
                venues.map((venue) => (
                <div
                  key={venue.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    formData.venue_id === venue.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, venue_id: venue.id }))}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        name="venue_id"
                        value={venue.id}
                        checked={formData.venue_id === venue.id}
                        onChange={() => setFormData(prev => ({ ...prev, venue_id: venue.id }))}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{venue.name}</h3>
                      {venue.location && (
                        <p className="text-sm text-gray-600 flex items-center mb-2">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{venue.location}</span>
                        </p>
                      )}
                      {venue.capacity && (
                        <p className="text-sm text-gray-600 flex items-center mb-3">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">Capacidade: {venue.capacity} pessoas</span>
                        </p>
                      )}
                      {venue.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{venue.description}</p>
                      )}
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">RECURSOS DISPONÍVEIS:</p>
                          <div className="flex flex-wrap gap-1">
                            {venue.amenities.map((amenity: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                              >
                                {amenity.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Event Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações do Evento
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Evento público (será exibido na lista de eventos públicos)
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Evento gratuito
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="requires_registration"
                  checked={formData.requires_registration}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Requer inscrição prévia
                </label>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Contratuais Adicionais
            </h2>
            <textarea
              name="contract_info"
              value={formData.contract_info}
              onChange={handleInputChange}
              rows={4}
              placeholder="Adicione qualquer informação adicional relevante para o contrato..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.venue_id}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting && <Calendar className="w-4 h-4 animate-spin" />}
              <span>{submitting ? "Enviando..." : "Enviar Solicitação"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
