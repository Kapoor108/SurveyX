import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const CEODepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = () => api.get('/ceo/departments').then(res => setDepartments(res.data));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ceo/departments', { name });
      setShowModal(false);
      setName('');
      loadDepartments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create department');
    }
  };

  const handleDeptClick = async (dept) => {
    if (selectedDept?._id === dept._id) {
      setSelectedDept(null);
      setDeptEmployees([]);
      return;
    }
    
    setSelectedDept(dept);
    setLoadingEmployees(true);
    try {
      const res = await api.get(`/ceo/departments/${dept._id}/employees`);
      setDeptEmployees(res.data.employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setDeptEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  return (
    <Layout title="Departments">
      <div className="mb-4">
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => (
          <div key={dept._id} 
            onClick={() => handleDeptClick(dept)}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedDept?._id === dept._id ? 'ring-2 ring-indigo-500' : ''
            }`}>
            <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
            <div className="flex gap-3 text-sm">
              <span className="text-indigo-600 font-medium">{dept.employeeCount || 0} employees</span>
              {dept.activeCount > 0 && (
                <span className="text-green-600">({dept.activeCount} active)</span>
              )}
              {dept.pendingCount > 0 && (
                <span className="text-yellow-600">({dept.pendingCount} pending)</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Created: {new Date(dept.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400 mt-2">Click to view employees</p>
          </div>
        ))}
      </div>

      {/* Employees Panel */}
      {selectedDept && (
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedDept.name} - Employees
            </h3>
            <button onClick={() => { setSelectedDept(null); setDeptEmployees([]); }} 
              className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          </div>
          
          {loadingEmployees ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : deptEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No employees in this department</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deptEmployees.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{emp.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{emp.departmentId?.name || selectedDept.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{emp.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          emp.inviteStatus === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {emp.inviteStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Department</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CEODepartments;
