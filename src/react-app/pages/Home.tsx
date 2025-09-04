import { Link } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext-simple";
import { Calendar, Users, ArrowRight, Award, TrendingUp, Shield } from "lucide-react";
import Header from "@/react-app/components/Header";

export default function Home() {
  const { user, signInWithGoogle } = useAuth();

  // Debug logs
  console.log('Home: Component rendered', { 
    hasUser: !!user, 
    userEmail: user?.email, 
    userDisplayName: user?.displayName,
    userUID: user?.uid 
  });

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema avançado de verificação de disponibilidade em tempo real com interface intuitiva para empresas.",
    },
    {
      icon: Shield,
      title: "Aprovação Eficiente",
      description: "Processo de aprovação profissional com notificações automáticas e controle administrativo completo.",
    },
    {
      icon: TrendingUp,
      title: "Gestão Corporativa",
      description: "Ferramentas especializadas para empresas organizarem eventos de alto padrão na UNIMAR.",
    },
    {
      icon: Award,
      title: "Espaços Premium",
      description: "Acesso exclusivo aos melhores espaços da UNIMAR com informações detalhadas de capacidade e recursos.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Credenciamento Empresarial",
      description: "Acesse com sua conta corporativa para verificação de legitimidade",
    },
    {
      number: "02",
      title: "Seleção de Espaços",
      description: "Escolha entre auditórios, salas e espaços especializados da UNIMAR",
    },
    {
      number: "03",
      title: "Detalhamento do Evento",
      description: "Complete o briefing com informações contratuais e especificações técnicas",
    },
    {
      number: "04",
      title: "Aprovação Institucional",
      description: "Análise técnica e aprovação pela administração da universidade",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://revistaensinosuperior.com.br/wp-content/uploads/2024/09/Foto-4-Unimar-scaled.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 bg-blue-600/80 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Award className="w-4 h-4 mr-2" />
              Plataforma Oficial UNIMAR
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Eventos Corporativos
              <span className="block text-blue-600">de Excelência</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl">
              Plataforma profissional para empresas que buscam organizar eventos de alto padrão 
              nos espaços premium da UNIMAR com processo de aprovação institucional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/booking"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Solicitar Agendamento</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Meus Agendamentos</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  <span>Entrar com Google</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <Link
                to="/events"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center space-x-2 backdrop-blur-sm"
              >
                <Users className="w-5 h-5" />
                <span>Eventos Públicos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Soluções Empresariais Completas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos uma plataforma robusta e profissional para empresas que valorizam 
              excelência na organização de eventos corporativos e institucionais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gray-50 rounded-xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Processo Profissional Simplificado
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um fluxo de trabalho otimizado para garantir que seu evento corporativo 
              seja executado com excelência e profissionalismo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-blue-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Eleve seus Eventos ao Próximo Nível
          </h2>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Junte-se às principais empresas que confiam na UNIMAR para 
            realizar eventos corporativos de impacto e excelência.
          </p>
          {user ? (
            <Link
              to="/booking"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-5 h-5" />
              <span>Iniciar Agendamento</span>
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Entrar com Google</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">UnimarEvents</span>
            </div>
            <p className="text-gray-600 mb-4">
              Plataforma Oficial de Eventos Corporativos da UNIMAR
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 UNIMAR. Todos os direitos reservados. Desenvolvido para excelência empresarial.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
