import { useState, useEffect } from 'react';

function App() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [serverStatus, setServerStatus] = useState('Connecting...');
  
  const [patientForm, setPatientForm] = useState({ fullName: '', email: '', phone: '', gender: 'Female' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'Medium' });

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setServerStatus(data.message))
      .catch(() => setServerStatus('Disconnected'));

    fetchPatients();
    fetchTasks();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientForm.fullName || !patientForm.email) return;

    try {
      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      const data = await res.json();
      if (data.success) {
        setPatients([...patients, data.data]);
        setPatientForm({ fullName: '', email: '', phone: '', gender: 'Female' });
      }
    } catch (err) {
      console.error('Error adding patient', err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return;

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();
      if (data.success) {
        setTasks([...tasks, data.data]);
        setTaskForm({ title: '', priority: 'Medium' });
      }
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  // Analytics Computations
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-8">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">
            HealthCRM Portal
          </h1>
          <p className="text-sm text-slate-400">
            Internal Patient Records, Tasks & Analytics Dashboard
          </p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs font-mono text-emerald-400">
          {serverStatus}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto mt-8 space-y-8">

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-mono">Total Patients</span>
            <p className="text-3xl font-extrabold text-slate-100 mt-1">{patients.length}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-mono">Active Tasks</span>
            <p className="text-3xl font-extrabold text-sky-400 mt-1">{tasks.length}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-mono">High Priority</span>
            <p className="text-3xl font-extrabold text-rose-400 mt-1">{highPriorityTasks}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-mono">Pending Queue</span>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">{pendingTasks}</p>
          </div>
        </div>
        
        {/* Patient Intake & Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">New Patient Intake</h2>
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={patientForm.fullName}
                  onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                  placeholder="Patient Name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  placeholder="patient@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 rounded transition"
              >
                Add Patient Record
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Patient Directory</h2>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-mono">
                Count: {patients.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-mono border-b border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30">
                      <td className="p-3 font-mono text-slate-500">#{p.id}</td>
                      <td className="p-3 font-medium text-slate-100">{p.fullName}</td>
                      <td className="p-3 text-slate-400">{p.email}</td>
                      <td className="p-3 text-slate-400">{p.phone}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Task Queue Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Create Task</h2>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Description</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Review lab results..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 rounded transition"
              >
                Assign Task
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Active Task Queue</h2>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-mono">
                Tasks: {tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-slate-500">#{t.id}</span>
                    <p className="text-sm text-slate-200 font-medium">{t.title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      t.priority === 'High' ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;