import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIAnnotatorProps {
  datasetId: string;
  datasetName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function AIAnnotator({ datasetId, datasetName, onSuccess, onClose }: AIAnnotatorProps) {
  const [projectId, setProjectId] = useState('');
  const [annotationType, setAnnotationType] = useState('text-classification');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('id, project_name')
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
  }

  async function handleAnnotate() {
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Fetching dataset...');

    try {
      const { data: files, error: fileError } = await supabase
        .from('dataset_files')
        .select('*')
        .eq('dataset_id', datasetId)
        .maybeSingle();

      if (fileError) throw fileError;
      if (!files) throw new Error('No file found for this dataset');

      setProgress('Creating annotation task...');

      const { data: task, error: taskError } = await supabase
        .from('annotation_tasks')
        .insert([
          {
            project_id: projectId,
            dataset_id: datasetId,
          }
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      setProgress('Processing with AI...');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-annotate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
          file_content: files.file_content,
          annotation_type: annotationType,
        }),
      });

      if (!response.ok) {
        throw new Error('AI annotation failed');
      }

      const result = await response.json();

      setProgress('Saving annotations...');

      const { data: user } = await supabase.auth.getUser();

      const annotations = result.annotations.map((annotation: any) => ({
        task_id: task.id,
        user_id: user.user?.id,
        content: JSON.stringify(annotation),
      }));

      const { error: annotationError } = await supabase
        .from('annotations')
        .insert(annotations);

      if (annotationError) throw annotationError;

      setProgress('Complete!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Failed to annotate with AI');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Auto-Annotation</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-lg disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Dataset:</strong> {datasetName}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="project" className="block text-sm font-semibold text-gray-700 mb-2">
                Select Project *
              </label>
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
              >
                <option value="">Choose a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
              {projects.length === 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  No projects found. Please create a project first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="annotationType" className="block text-sm font-semibold text-gray-700 mb-2">
                Annotation Type *
              </label>
              <select
                id="annotationType"
                value={annotationType}
                onChange={(e) => setAnnotationType(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
              >
                <option value="text-classification">Text Classification</option>
                <option value="sentiment-analysis">Sentiment Analysis</option>
                <option value="named-entity-recognition">Named Entity Recognition</option>
                <option value="summarization">Summarization</option>
              </select>
            </div>
          </div>

          {loading && progress && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="text-sm font-medium text-purple-900">{progress}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 text-base border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAnnotate}
              disabled={loading || !projectId}
              className="flex-1 px-6 py-4 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Start AI Annotation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
