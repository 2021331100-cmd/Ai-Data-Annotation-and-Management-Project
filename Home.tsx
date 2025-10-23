import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { Database, Users, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Annotate</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signin')}
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 font-medium transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Data Annotation
            <span className="block text-blue-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Streamline your machine learning workflow with our powerful annotation platform.
            Collaborate with your team and deliver high-quality labeled datasets.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center space-x-2"
            >
              <span>Start Annotating</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-200 transition"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Dataset Management
            </h3>
            <p className="text-gray-600">
              Organize and manage your datasets efficiently with our intuitive interface.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Work seamlessly with your team through role-based access and task assignments.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quality Review
            </h3>
            <p className="text-gray-600">
              Ensure accuracy with built-in review workflows and quality control processes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-pink-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Progress Tracking
            </h3>
            <p className="text-gray-600">
              Monitor project progress with comprehensive analytics and audit logs.
            </p>
          </div>
        </div>

        <div className="mt-24 bg-white rounded-3xl shadow-2xl p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of teams who trust our platform for their annotation needs.
              Sign up now and start your first project in minutes.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center space-x-2"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Database className="w-6 h-6" />
              <span className="text-lg font-bold">AI Annotate</span>
            </div>
            <p className="text-gray-400">
              Professional data annotation and management platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
