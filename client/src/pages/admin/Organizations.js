import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const AdminOrganizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [form, setForm] = useState({ name: '', ceoEmail: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOrgs(); }, []);

  const loadOrgs = () => api.get('/admin/organizations').then(res => setOrgs(res.data)).catch(console.error);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/organizations', form);
      setShowModal(false);
      setForm({ name: '', ceoEmail: '' });
      setCreateResult(res.data);
      setShowResultModal(true);
      loadOrgs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create organization');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Layout title="Organizations">
      <div className="mb-4">
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Add Organization
        </button>
      </div>

      {orgs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No organizations yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => (
            <Link key={org._id} to={`/admin/organizations/${org._id}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{org.name}</h3>
                <span className={`px-2 py-1 text-xs rounded ${org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {org.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{org.ceoEmail}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Employees:</span> {org.stats?.employees || 0}</div>
                <div><span className="text-gray-500">Departments:</span> {org.stats?.departments || 0}</div>
                <div><span className="text-gray-500">Surveys:</span> {org.stats?.surveys || 0}</div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">Completion:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getCompletionColor(org.stats?.completionRate || 0)}`} style={{ width: `${org.stats?.completionRate || 0}%` }}></div>
                  </div>
                  <span className="ml-2">{org.stats?.completionRate || 0}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Organization</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required
                  placeholder="e.g., Acme Corporation"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CEO Email</label>
                <input 
                  type="email" 
                  value={form.ceoEmail} 
                  onChange={e => setForm({ ...form, ceoEmail: e.target.value })} 
                  required
                  placeholder="ceo@company.com"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                />
                <p className="text-xs text-gray-500 mt-1">An invitation will be sent to this email</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create & Invite CEO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && createResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="text-center mb-4">
              {createResult.emailSent ? (
                <div className="text-green-500 text-5xl mb-2">✓</div>
              ) : (
                <div className="text-yellow-500 text-5xl mb-2">⚠️</div>
              )}
              <h2 className="text-xl font-semibold">
                {createResult.emailSent ? 'Organization Created!' : 'Organization Created (Email Failed)'}
              </h2>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Organization:</strong> {createResult.org?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>CEO Email:</strong> {createResult.org?.ceoEmail}
              </p>
              {!createResult.emailSent && (
                <div className="mt-4">
                  <p className="text-sm text-red-600 mb-2">
                    Email could not be sent. Share this signup link manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={createResult.signupLink} 
                      readOnly 
                      className="flex-1 px-3 py-2 border rounded text-sm bg-white"
                    />
                    <button 
                      onClick={() => copyToClipboard(createResult.signupLink)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
              {createResult.emailSent && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Invitation email sent successfully!
                </p>
              )}
            </div>

            <button 
              onClick={() => setShowResultModal(false)} 
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminOrganizations;
