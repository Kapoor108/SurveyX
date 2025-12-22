import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const CEOEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', departmentId: '' });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [empRes, deptRes] = await Promise.all([
      api.get('/ceo/employees'),
      api.get('/ceo/departments')
    ]);
    setEmployees(empRes.data);
    setDepartments(deptRes.data);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/ceo/invite', form);
      setShowModal(false);
      setForm({ name: '', email: '', departmentId: '' });
      loadData();
      alert('Invitation sent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invite');
    }
    setLoading(false);
  };

  const handleResendInvite = async (empId) => {
    setResending(empId);
    try {
      await api.post(`/ceo/invite/${empId}/resend`);
      alert('Invitation resent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resend invite');
    }
    setResending(null);
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to delete ${empName || 'this employee'}? This will also delete all their survey responses and assignments.`)) {
      return;
    }
    setDeleting(empId);
    try {
      await api.delete(`/ceo/employees/${empId}`);
      loadData();
      alert('Employee deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
    setDeleting(null);
  };

  const handleBatchUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      const employeeList = data.map(row => ({
        name: row.Name || row.name || '',
        email: row.Email || row.email,
        departmentId: departments.find(d => 
          d.name.toLowerCase() === (row.Department || row.department || '').toLowerCase()
        )?._id
      })).filter(e => e.email);

      if (employeeList.length === 0) {
        alert('No valid employees found. Ensure columns: Name, Email, Department');
        return;
      }

      try {
        const res = await api.post('/ceo/invite/batch', { employees: employeeList });
        alert(res.data.message);
        loadData();
      } catch (err) {
        alert(err.response?.data?.error || 'Batch invite failed');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const pendingCount = employees.filter(e => e.inviteStatus === 'pending').length;
  const acceptedCount = employees.filter(e => e.inviteStatus === 'accepted').length;

  return (
    <Layout title="Employees">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Invited</p>
          <p className="text-2xl font-bold">{employees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending Invites</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Invite Employee
        </button>
        <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
          📤 Upload Excel
          <input type="file" accept=".xlsx,.xls" onChange={handleBatchUpload} className="hidden" />
        </label>
        <a 
          href="/sample-employees.xlsx" 
          download
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          onClick={(e) => {
            e.preventDefault();
            // Create sample Excel
            const ws = XLSX.utils.json_to_sheet([
              { Name: 'John Doe', Email: 'john@example.com', Department: 'Engineering' },
              { Name: 'Jane Smith', Email: 'jane@example.com', Department: 'Marketing' }
            ]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Employees');
            XLSX.writeFile(wb, 'sample-employees.xlsx');
          }}
        >
          📥 Download Sample
        </a>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp._id}>
                <td className="px-6 py-4 font-medium">{emp.name}</td>
                <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                <td className="px-6 py-4">{emp.departmentId?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    emp.inviteStatus === 'accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {emp.inviteStatus === 'accepted' ? '✓ Active' : '⏳ Pending'}
                  </span>
                  {emp.inviteStatus === 'accepted' && emp.acceptedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Accepted: {new Date(emp.acceptedAt).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {emp.inviteStatus === 'pending' && (
                      <button
                        onClick={() => handleResendInvite(emp._id)}
                        disabled={resending === emp._id}
                        className="text-indigo-600 hover:text-indigo-800 text-sm disabled:opacity-50"
                      >
                        {resending === emp._id ? 'Sending...' : '🔄 Resend'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                      disabled={deleting === emp._id}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deleting === emp._id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No employees yet. Start by inviting team members!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Invite Employee</h2>
            <p className="text-sm text-gray-600 mb-4">
              An invitation email will be sent with a signup link.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Employee name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required
                  placeholder="employee@example.com"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <select 
                  value={form.departmentId} 
                  onChange={e => setForm({ ...form, departmentId: e.target.value })} 
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please create departments first
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || departments.length === 0} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CEOEmployees;
