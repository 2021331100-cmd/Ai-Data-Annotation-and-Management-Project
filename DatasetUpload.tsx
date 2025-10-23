import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X } from 'lucide-react';

interface DatasetUploadProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function DatasetUpload({ onSuccess, onClose }: DatasetUploadProps) {
  const [datasetName, setDatasetName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('CSV');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileContent = await file.text();

      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .insert([
          {
            dataset_name: datasetName,
            description,
            format,
          }
        ])
        .select()
        .single();

      if (datasetError) throw datasetError;

      const rows = fileContent.split('\n').filter(row => row.trim());

      const { error: storageError } = await supabase
        .from('dataset_files')
        .insert([
          {
            dataset_id: dataset.id,
            file_name: file.name,
            file_content: fileContent,
            file_size: file.size,
            row_count: rows.length,
          }
        ]);

      if (storageError) throw storageError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload dataset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">Upload Dataset</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="datasetName" className="block text-sm font-semibold text-gray-700 mb-2">
                Dataset Name *
              </label>
              <input
                id="datasetName"
                type="text"
                required
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Enter dataset name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Enter dataset description (optional)"
              />
            </div>

            <div>
              <label htmlFor="format" className="block text-sm font-semibold text-gray-700 mb-2">
                Format *
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
                <option value="TXT">TXT</option>
                <option value="XML">XML</option>
                <option value="IMAGE">IMAGE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition bg-gray-50">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="hidden"
                  accept=".csv,.json,.txt,.xml"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="w-12 h-12 text-blue-500" />
                  <div>
                    <span className="text-base font-medium text-gray-700 block">
                      {file ? file.name : 'Click here to select a file'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1 block">
                      CSV, JSON, TXT, XML files supported
                    </span>
                  </div>
                </label>
              </div>
              {file && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-green-700">
                    Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
            </div>
          </div>

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
              type="submit"
              disabled={loading || !datasetName || !file}
              className="flex-1 px-6 py-4 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
