import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import CEOLayout from '../../components/CEOLayout';
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

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      e.target.value = '';
      return;
    }

    // Check if departments exist
    if (departments.length === 0) {
      alert('Please create departments first before uploading employees');
      e.target.value = '';
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('Excel file is empty. Please add employee data.');
          setLoading(false);
          return;
        }

        // Validate and map employees
        const employeeList = [];
        const errors = [];

        data.forEach((row, index) => {
          const rowNum = index + 2; // Excel row number (accounting for header)
          const name = row.Name || row.name || '';
          const email = (row.Email || row.email || '').trim().toLowerCase();
          const deptName = (row.Department || row.department || row.Branch || row.branch || '').trim();

          // Validate email
          if (!email) {
            errors.push(`Row ${rowNum}: Email is required`);
            return;
          }

          if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push(`Row ${rowNum}: Invalid email format (${email})`);
            return;
          }

          // Find department
          const department = departments.find(d => 
            d.name.toLowerCase() === deptName.toLowerCase()
          );

          if (!department) {
            errors.push(`Row ${rowNum}: Department "${deptName}" not found. Available: ${departments.map(d => d.name).join(', ')}`);
            return;
          }

          employeeList.push({
            name: name || 'Employee',
            email,
            departmentId: department._id
          });
        });

        // Show validation errors
        if (errors.length > 0) {
          const errorMsg = `Found ${errors.length} error(s):\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n\n...and ${errors.length - 5} more errors` : ''}`;
          alert(errorMsg);
          setLoading(false);
          return;
        }

        if (employeeList.length === 0) {
          alert('No valid employees found. Ensure columns: Name, Email, Department (or Branch)');
          setLoading(false);
          return;
        }

        // Confirm before sending
        const confirmed = window.confirm(
          `Ready to invite ${employeeList.length} employee(s)?\n\n` +
          `Each will receive an email invitation to join the application.\n\n` +
          `Click OK to proceed.`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        // Send batch invite
        const res = await api.post('/ceo/invite/batch', { employees: employeeList });
        
        // Show detailed results
        const results = res.data.results || [];
        const invited = results.filter(r => r.status === 'invited').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const failed = results.filter(r => r.status === 'failed').length;

        let message = `✅ Successfully invited ${invited} employee(s)`;
        if (skipped > 0) message += `\n⚠️ Skipped ${skipped} (already exists or pending)`;
        if (failed > 0) message += `\n❌ Failed ${failed}`;

        alert(message);
        loadData();
      } catch (err) {
        console.error('Batch upload error:', err);
        alert(err.response?.data?.error || 'Batch invite failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert('Failed to read Excel file. Please try again.');
      setLoading(false);
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const pendingCount = employees.filter(e => e.inviteStatus === 'pending').length;
  const acceptedCount = employees.filter(e => e.inviteStatus === 'accepted').length;

  return (
    <CEOLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Invited</p>
          <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Pending Invites</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Employee
          </button>
          <label className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 cursor-pointer shadow-lg hover:shadow-xl transition-all font-semibold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleBatchUpload} className="hidden" disabled={loading} />
          </label>
          <button
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            onClick={(e) => {
              e.preventDefault();
              const sampleData = departments.length > 0 
                ? [
                    { Name: 'John Doe', Email: 'john@example.com', Department: departments[0].name },
                    { Name: 'Jane Smith', Email: 'jane@example.com', Department: departments[0].name }
                  ]
                : [
                    { Name: 'John Doe', Email: 'john@example.com', Department: 'Engineering' },
                    { Name: 'Jane Smith', Email: 'jane@example.com', Department: 'Marketing' }
                  ];
              
              const ws = XLSX.utils.json_to_sheet(sampleData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Employees');
              XLSX.writeFile(wb, 'employee-template.xlsx');
            }}
            title="Download Excel template with your department names">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Sample
          </button>
        </div>
        
        {/* Premium Feature Button */}
        <Link to="/pricing" 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Employee Survey
        </Link>
      </div>

      {/* Excel Upload Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-3">How to Upload Employees via Excel</h3>
            <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
              <li>Download the sample Excel template above</li>
              <li>Fill in employee details with columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Department</strong> (or <strong>Branch</strong>)</li>
              <li>Department names must match exactly: {departments.length > 0 ? <strong>{departments.map(d => d.name).join(', ')}</strong> : <span className="text-red-600">Create departments first</span>}</li>
              <li>Upload the Excel file - all employees will receive email invitations automatically</li>
              <li>Employees can sign up using the invitation link sent to their email</li>
            </ol>
            <p className="text-xs text-blue-600 mt-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tip: Each employee will be stored in the database and can login immediately after accepting the invitation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {emp.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-semibold text-gray-900">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                <td className="px-6 py-4 text-gray-600">{emp.departmentId?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    emp.inviteStatus === 'accepted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {emp.inviteStatus === 'accepted' ? 'Active' : 'Pending'}
                  </span>
                  {emp.inviteStatus === 'accepted' && emp.acceptedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Accepted: {new Date(emp.acceptedAt).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {emp.inviteStatus === 'pending' && (
                      <button
                        onClick={() => handleResendInvite(emp._id)}
                        disabled={resending === emp._id}
                        className="text-indigo-600 hover:text-indigo-800 text-sm disabled:opacity-50 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {resending === emp._id ? 'Sending...' : 'Resend'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                      disabled={deleting === emp._id}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deleting === emp._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No employees yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start by inviting team members!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invite Employee</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              An invitation email will be sent with a signup link
            </p>
            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name (Optional)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Employee name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required
                  placeholder="employee@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <select 
                  value={form.departmentId} 
                  onChange={e => setForm({ ...form, departmentId: e.target.value })} 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Please create departments first
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || departments.length === 0} 
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all font-semibold shadow-lg">
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </CEOLayout>
  );
};

export default CEOEmployees;
