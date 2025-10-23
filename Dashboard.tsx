import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { supabase } from '../lib/supabase';
import { DatasetUpload } from '../components/DatasetUpload';
import { AIAnnotator } from '../components/AIAnnotator';
import { ProjectCreate } from '../components/ProjectCreate';
import {
  Database,
  FolderOpen,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  Tag,
  FileCheck,
  Bell,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Dataset {
  id: string;
  dataset_name: string;
  description: string;
  format: string;
  created_at: string;
}

interface Task {
  id: string;
  due_date: string;
  created_at: string;
  projects: { project_name: string };
  datasets: { dataset_name: string };
}

interface Annotation {
  id: string;
  content: string;
  created_at: string;
  annotation_tasks: { id: string };
}

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showAIAnnotator, setShowAIAnnotator] = useState(false);
  const [showProjectCreate, setShowProjectCreate] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadData();
  }, [user, activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'projects':
          await loadProjects();
          break;
        case 'datasets':
          await loadDatasets();
          break;
        case 'tasks':
          await loadTasks();
          break;
        case 'annotations':
          await loadAnnotations();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProjects(data || []);
  }

  async function loadDatasets() {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDatasets(data || []);
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from('annotation_tasks')
      .select('*, projects(project_name), datasets(dataset_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  }

  async function loadAnnotations() {
    const { data, error } = await supabase
      .from('annotations')
      .select('*, annotation_tasks(id)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAnnotations(data || []);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (!user || !profile) {
    return null;
  }

  const canManage = profile.role === 'Admin' || profile.role === 'Manager';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Database className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Annotate</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{profile.username}</div>
                  <div className="text-xs text-gray-500">{profile.role}</div>
                </div>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {profile.role}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900 flex items-center space-x-2 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your annotation projects and tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FolderOpen className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{projects.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Projects</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{datasets.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Datasets</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <ClipboardList className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Tasks</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="w-8 h-8 text-pink-600" />
              <span className="text-2xl font-bold text-gray-900">{annotations.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">Annotations</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === 'projects'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>Projects</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('datasets')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === 'datasets'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Datasets</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === 'tasks'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>Tasks</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('annotations')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === 'annotations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Annotations</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === 'projects' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                      {canManage && (
                        <button
                          onClick={() => setShowProjectCreate(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Project</span>
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Project Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Start Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">End Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-gray-500">
                                No projects found. {canManage && 'Create your first project to get started.'}
                              </td>
                            </tr>
                          ) : (
                            projects.map((project) => (
                              <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-4 px-4 font-medium text-gray-900">{project.project_name}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                    project.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {project.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-600">{project.start_date || 'N/A'}</td>
                                <td className="py-4 px-4 text-gray-600">{project.end_date || 'N/A'}</td>
                                <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{project.description || 'No description'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'datasets' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Datasets</h2>
                      {canManage && (
                        <button
                          onClick={() => setShowUpload(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Upload Dataset</span>
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Dataset Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Format</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Created</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Description</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datasets.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-gray-500">
                                No datasets found. {canManage && 'Upload your first dataset to begin.'}
                              </td>
                            </tr>
                          ) : (
                            datasets.map((dataset) => (
                              <tr key={dataset.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-4 px-4 font-medium text-gray-900">{dataset.dataset_name}</td>
                                <td className="py-4 px-4">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {dataset.format}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {new Date(dataset.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{dataset.description || 'No description'}</td>
                                <td className="py-4 px-4">
                                  <button
                                    onClick={() => {
                                      setSelectedDataset(dataset);
                                      setShowAIAnnotator(true);
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    <span>AI Annotate</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Annotation Tasks</h2>
                      {canManage && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                          <Plus className="w-4 h-4" />
                          <span>New Task</span>
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Project</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Dataset</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Due Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-12 text-gray-500">
                                No tasks found. {canManage && 'Create a task to assign work.'}
                              </td>
                            </tr>
                          ) : (
                            tasks.map((task) => (
                              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-4 px-4 font-medium text-gray-900">{task.projects.project_name}</td>
                                <td className="py-4 px-4 text-gray-600">{task.datasets.dataset_name}</td>
                                <td className="py-4 px-4 text-gray-600">{task.due_date || 'N/A'}</td>
                                <td className="py-4 px-4 text-gray-600">
                                  {new Date(task.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'annotations' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">My Annotations</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Task ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Content</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {annotations.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center py-12 text-gray-500">
                                No annotations yet. Start annotating tasks to see them here.
                              </td>
                            </tr>
                          ) : (
                            annotations.map((annotation) => (
                              <tr key={annotation.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-4 px-4 font-mono text-sm text-gray-600">
                                  {annotation.annotation_tasks.id.substring(0, 8)}...
                                </td>
                                <td className="py-4 px-4 text-gray-900 max-w-md truncate">{annotation.content || 'Empty'}</td>
                                <td className="py-4 px-4 text-gray-600">
                                  {new Date(annotation.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showProjectCreate && (
        <ProjectCreate
          onSuccess={() => {
            loadData();
            setShowProjectCreate(false);
          }}
          onClose={() => setShowProjectCreate(false)}
        />
      )}

      {showUpload && (
        <DatasetUpload
          onSuccess={() => {
            loadData();
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showAIAnnotator && selectedDataset && (
        <AIAnnotator
          datasetId={selectedDataset.id}
          datasetName={selectedDataset.dataset_name}
          onSuccess={() => {
            loadData();
            setShowAIAnnotator(false);
            setSelectedDataset(null);
          }}
          onClose={() => {
            setShowAIAnnotator(false);
            setSelectedDataset(null);
          }}
        />
      )}
    </div>
  );
}
