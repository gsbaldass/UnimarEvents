import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Search, Filter } from "lucide-react";
import Header from "@/react-app/components/Header";
import { useNavigate } from "react-router";
import { getAllBookings, getVenues } from "@/react-app/services/firestoreDatabase";
import type { FirestoreBooking } from "@/react-app/services/firestoreDatabase";

interface PublicEvent {
  id: string;
  company_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_title: string;
  event_description?: string;
  is_free: boolean;
  requires_registration: boolean;
  expected_attendees?: number;
  venue_name: string;
  venue_location?: string;
}

export default function PublicEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [bookings, venues] = await Promise.all([
        getAllBookings(),
        getVenues()
      ]);

      const publicApproved = bookings
        .filter((b: FirestoreBooking) => b.status === "approved" && b.is_public)
        .map((b: FirestoreBooking) => {
          const venue = venues.find(v => v.id === b.venue_id);
          return {
            id: b.id as string,
            company_name: b.company_name,
            event_date: b.event_date,
            start_time: b.start_time,
            end_time: b.end_time,
            event_title: b.event_title,
            event_description: b.event_description,
            is_free: b.is_free,
            requires_registration: b.requires_registration,
            expected_attendees: b.expected_attendees,
            venue_name: venue?.name || "Local não encontrado",
            venue_location: venue?.location
          } as PublicEvent;
        })
        // ordenar por data e horário
        .sort((a, b) => {
          const d = a.event_date.localeCompare(b.event_date);
          if (d !== 0) return d;
          return a.start_time.localeCompare(b.start_time);
        });

      setEvents(publicApproved);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const isToday = (dateString: string) => {
    const today = new Date().toDateString();
    const eventDate = new Date(dateString).toDateString();
    return today === eventDate;
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(dateString).toDateString();
    return tomorrow.toDateString() === eventDate;
  };

  const getDateLabel = (dateString: string) => {
    if (isToday(dateString)) return "Hoje";
    if (isTomorrow(dateString)) return "Amanhã";
    return null;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.event_description && event.event_description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = 
      filterType === "all" ||
      (filterType === "free" && event.is_free) ||
      (filterType === "paid" && !event.is_free);

    return matchesSearch && matchesFilter;
  });

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = event.event_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, PublicEvent[]>);

  if (loading) {
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
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Eventos Públicos</h1>
          <p className="text-gray-600 mt-2">
            Descubra eventos aprovados e abertos para participação na UNIMAR
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar eventos por título, empresa, local..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os eventos</option>
                <option value="free">Apenas gratuitos</option>
                <option value="paid">Apenas pagos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {events.length === 0 ? "Nenhum evento público encontrado" : "Nenhum evento corresponde aos filtros"}
            </h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? "Não há eventos públicos agendados no momento"
                : "Tente alterar os termos de busca ou filtros"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, dayEvents]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {formatDate(date)}
                    </h2>
                    {getDateLabel(date) && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {getDateLabel(date)}
                      </span>
                    )}
                  </div>

                  {/* Events for this date */}
                  <div className="space-y-6">
                    {dayEvents
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((event) => (
                        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {event.event_title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {event.is_free && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                        Gratuito
                                      </span>
                                    )}
                                    {event.requires_registration && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                        Inscrição obrigatória
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">
                                  Organizado por: <span className="font-medium">{event.company_name}</span>
                                </p>
                              </div>
                            </div>

                            {event.event_description && (
                              <p className="text-gray-700 mb-4">
                                {event.event_description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {event.venue_name}
                                  {event.venue_location && ` - ${event.venue_location}`}
                                </span>
                              </div>

                              {event.expected_attendees && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{event.expected_attendees} participantes esperados</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {isToday(event.event_date) ? "Hoje" : 
                                     isTomorrow(event.event_date) ? "Amanhã" : 
                                     formatDate(event.event_date)}
                                  </span>
                                </div>
                                
                                <div className="mt-2 sm:mt-0">
                                  {event.requires_registration ? (
                                    <span className="text-purple-600 font-medium">
                                      Inscrição necessária
                                    </span>
                                  ) : (
                                    <span className="text-green-600 font-medium">
                                      Entrada livre
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
