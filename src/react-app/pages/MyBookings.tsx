import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext-simple";
import { useNavigate, Link } from "react-router";
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Hourglass, ArrowLeft, Plus } from "lucide-react";
import Header from "@/react-app/components/Header";
import { getUserBookings, getVenues } from "@/react-app/services/firestoreDatabase";
import type { FirestoreBooking } from "@/react-app/services/firestoreDatabase";
import { Timestamp } from "firebase/firestore";

interface UserBooking extends FirestoreBooking {
  venue_name: string;
  venue_location: string;
}

export default function MyBookings() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, isPending, navigate]);

  const fetchBookings = async () => {
    try {
      console.log('=== MY BOOKINGS DEBUG ===');
      console.log('User object:', user);
      console.log('User UID:', user?.uid);
      console.log('User UID type:', typeof user?.uid);
      
      if (!user?.uid) {
        console.log('No user UID found!');
        return;
      }
      
      console.log('Calling getUserBookings with UID:', user.uid);
      const userBookings = await getUserBookings(user.uid);
      console.log('User bookings received:', userBookings);
      console.log('User bookings length:', userBookings.length);
      
      const venues = await getVenues();
      console.log('Venues received:', venues);
      console.log('Venues length:', venues.length);
      
      // Combine bookings with venue information
      const bookingsWithVenues = userBookings.map(booking => {
        const venue = venues.find(v => v.id === booking.venue_id);
        console.log('Booking venue_id:', booking.venue_id, 'Found venue:', venue);
        return {
          ...booking,
          venue_name: venue?.name || 'Local não encontrado',
          venue_location: venue?.location || 'Localização não disponível'
        };
      });
      
      console.log('Final bookings with venues:', bookingsWithVenues);
      console.log('Setting bookings state with:', bookingsWithVenues.length, 'items');
      setBookings(bookingsWithVenues);
      
      // Update debug info
      setDebugInfo(`Última busca: ${new Date().toLocaleTimeString()} - ${bookingsWithVenues.length} agendamentos encontrados`);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Hourglass className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      default:
        return "Pendente";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString("pt-BR");
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR");
    }
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const approvedCount = bookings.filter(b => b.status === "approved").length;
  const rejectedCount = bookings.filter(b => b.status === "rejected").length;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
            <Link
              to="/booking"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </Link>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Meus Agendamentos</h1>
                <p className="text-blue-100 mt-1">
                  Acompanhe o status dos seus pedidos de agendamento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Hourglass className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aguardando Análise</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eventos Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solicitações Negadas</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtrar Meus Agendamentos</h3>
            <button
              onClick={() => {
                setLoading(true);
                fetchBookings();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              🔄 Recarregar Dados
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "Todos os Agendamentos", count: bookings.length },
              { key: "pending", label: "Pendentes", count: pendingCount },
              { key: "approved", label: "Aprovados", count: approvedCount },
              { key: "rejected", label: "Rejeitados", count: rejectedCount },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as any)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  filter === item.key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "Você ainda não fez nenhum pedido de agendamento"
                : `Não há agendamentos ${filter === "pending" ? "pendentes" : filter === "approved" ? "aprovados" : "rejeitados"}`
              }
            </p>
            <Link
              to="/booking"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Fazer Primeiro Agendamento</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.event_title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusBadgeClass(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span>{getStatusText(booking.status)}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Empresa: {booking.company_name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Solicitado em {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.event_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.venue_name}</span>
                    </div>
                  </div>

                  {booking.venue_location && (
                    <p className="text-sm text-gray-600 mb-4">
                      Local: {booking.venue_location}
                    </p>
                  )}

                  {booking.event_description && (
                    <p className="text-gray-700 mb-4">
                      {booking.event_description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {booking.expected_attendees && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{booking.expected_attendees} participantes esperados</span>
                      </div>
                    )}
                    {booking.is_public && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        Público
                      </span>
                    )}
                    {booking.is_free && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Gratuito
                      </span>
                    )}
                    {booking.requires_registration && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        Inscrição obrigatória
                      </span>
                    )}
                  </div>

                  {booking.status === "rejected" && booking.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-red-800 mb-2">Motivo da rejeição:</h4>
                      <p className="text-red-700 text-sm">{booking.rejection_reason}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span><strong>Contato:</strong> {booking.contact_name}</span>
                        <span><strong>Telefone:</strong> {booking.contact_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <span>{booking.contact_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}