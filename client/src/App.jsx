import { useState, useEffect } from 'react';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://health-crm-portal-heb8.onrender.com';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Active Role Simulation (RBAC)
  const [userRole, setUserRole] = useState('Nurse'); // 'Receptionist' | 'Nurse' | 'Doctor'

  // Vitals Modal State
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    systolicBP: '',
    diastolicBP: '',
    pulseRate: '',
    weight: '',
    loggedBy: 'Nurse'
  });

  // Task Filter & Sort State
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Form states
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    insuranceProvider: 'SHA/NHIF',
    shaNumber: '',
    claimStatus: 'Pending',
    preAuthCode: ''
  });

  const [taskForm, setTaskForm] = useState({ title: '', priority: 'Medium', assignedPatient: '' });

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchTasks();
  }, [search]);

  // Save Patient (With SHA / NHIF fields)
  const handleSavePatient = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingPatientId);
    const url = isEdit 
      ? `${API_BASE_URL}/api/patients/${editingPatientId}` 
      : `${API_BASE_URL}/api/patients`;
    
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      const data = await res.json();
      if (data.success) {
        resetPatientForm();
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error saving patient:', err);
    }
  };

  const resetPatientForm = () => {
    setPatientForm({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Female',
      insuranceProvider: 'SHA/NHIF',
      shaNumber: '',
      claimStatus: 'Pending',
      preAuthCode: ''
    });
    setEditingPatientId(null);
  };

  const handleStartEdit = (patient) => {
    setEditingPatientId(patient._id);
    setPatientForm({
      fullName: patient.fullName,
      email: patient.email || '',
      phone: patient.phone,
      gender: patient.gender || 'Female',
      insuranceProvider: patient.insuranceProvider || 'Cash',
      shaNumber: patient.shaNumber || '',
      claimStatus: patient.claimStatus || 'None',
      preAuthCode: patient.preAuthCode || ''
    });
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  };

  // Submit Vitals for a Patient
  const handleAddVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatientForVitals) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${selectedPatientForVitals._id}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vitalsForm, loggedBy: userRole })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPatientForVitals(null);
        setVitalsForm({ temperature: '', systolicBP: '', diastolicBP: '', pulseRate: '', weight: '', loggedBy: userRole });
        fetchPatients();
      }
    } catch (err) {
      console.error('Error adding vitals:', err);
    }
  };

  // Submit Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();
      if (data.success) {
        setTaskForm({ title: '', priority: 'Medium', assignedPatient: '' });
        fetchTasks();
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleCycleStatus = async (task) => {
    const statusOrder = ['Pending', 'In Progress', 'Completed'];
    const nextStatus = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length];

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${task._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Filter & Sort Logic for Tasks
  const filteredTasks = tasks
    .filter((task) => statusFilter === 'All' || task.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      return 0;
    });

  // Analytics Computations
  const totalPatients = patients.length;
  const shaClaimsPending = patients.filter((p) => p.claimStatus === 'Pending').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="app-layout">
      <header className="navbar">
        <div>
          <h1>AfyaCRM Hospital Portal</h1>
          <p className="subtitle">Clinical Operations & Triage System</p>
        </div>
        
        {/* Role Switcher */}
        <div className="role-switcher">
          <label>Active Role: </label>
          <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
            <option value="Receptionist">Receptionist</option>
            <option value="Nurse">Triage Nurse</option>
            <option value="Doctor">Consulting Physician</option>
          </select>
        </div>
      </header>

      {/* Analytics Summary Bar */}
      <section className="analytics-bar">
        <div className="stat-card">
          <span className="stat-label">Total Patients</span>
          <span className="stat-value">{totalPatients}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending SHA Claims</span>
          <span className="stat-value warning">{shaClaimsPending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Triage Tasks</span>
          <span className="stat-value warning">{pendingTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Task Completion</span>
          <span className="stat-value success">{completionRate}%</span>
        </div>
      </section>

      <main className="dashboard-grid">
        {/* Patients Section */}
        <section className="card">
          <h2>Patient Directory & SHA/NHIF Tracking</h2>
          
          <input
            type="text"
            placeholder="Search patients by name or phone..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Registration Form */}
          <form onSubmit={handleSavePatient} className="form-stack">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={patientForm.fullName}
              onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
            />
            <div className="form-row">
              <input
                type="tel"
                placeholder="Phone Number (+254)"
                required
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* SHA / NHIF Section */}
            <div className="form-row">
              <select
                value={patientForm.insuranceProvider}
                onChange={(e) => setPatientForm({ ...patientForm, insuranceProvider: e.target.value })}
              >
                <option value="SHA/NHIF">SHA / NHIF Provider</option>
                <option value="Private">Private Insurance</option>
                <option value="Cash">Cash / Self-Pay</option>
              </select>
              {patientForm.insuranceProvider === 'SHA/NHIF' && (
                <input
                  type="text"
                  placeholder="SHA/NHIF Card No."
                  value={patientForm.shaNumber}
                  onChange={(e) => setPatientForm({ ...patientForm, shaNumber: e.target.value })}
                />
              )}
            </div>

            {patientForm.insuranceProvider === 'SHA/NHIF' && (
              <div className="form-row">
                <select
                  value={patientForm.claimStatus}
                  onChange={(e) => setPatientForm({ ...patientForm, claimStatus: e.target.value })}
                >
                  <option value="None">Claim: None</option>
                  <option value="Pending">Claim: Pending Approval</option>
                  <option value="Approved">Claim: Approved</option>
                  <option value="Rejected">Claim: Rejected</option>
                </select>
                <input
                  type="text"
                  placeholder="Pre-Auth Code (If approved)"
                  value={patientForm.preAuthCode}
                  onChange={(e) => setPatientForm({ ...patientForm, preAuthCode: e.target.value })}
                />
              </div>
            )}

            <div className="btn-group">
              <button type="submit">{editingPatientId ? 'Update Record' : 'Register Patient'}</button>
              {editingPatientId && (
                <button type="button" className="btn-secondary" onClick={resetPatientForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Scrollable Patient List */}
          <div className="scroll-container">
            <ul className="item-list">
              {patients.map((p) => (
                <li key={p._id} className="list-item flex-column">
                  <div className="patient-header-row">
                    <div>
                      <strong>{p.fullName}</strong> ({p.gender})
                      <p>{p.phone} | Provider: {p.insuranceProvider || 'Cash'}</p>
                      {p.shaNumber && <p className="meta-text">SHA No: {p.shaNumber} | Pre-Auth: {p.preAuthCode || 'N/A'}</p>}
                    </div>
                    <div className="action-row">
                      <span className={`badge claim-${(p.claimStatus || 'none').toLowerCase()}`}>
                        {p.claimStatus || 'Cash'}
                      </span>
                      <button className="btn-icon" onClick={() => setSelectedPatientForVitals(p)} title="Log Vitals">
                        🩺
                      </button>
                      <button className="btn-icon" onClick={() => handleStartEdit(p)}>✏️</button>
                      <button className="btn-icon danger" onClick={() => handleDeletePatient(p._id)}>🗑️</button>
                    </div>
                  </div>

                  {/* Vitals Summary Card */}
                  {p.vitals && p.vitals.length > 0 && (
                    <div className="vitals-preview">
                      <small><strong>Latest Vitals ({new Date(p.vitals[p.vitals.length - 1].loggedAt).toLocaleDateString()}):</strong></small>
                      <span> Temp: {p.vitals[p.vitals.length - 1].temperature || '--'}°C</span> |
                      <span> BP: {p.vitals[p.vitals.length - 1].systolicBP || '--'}/{p.vitals[p.vitals.length - 1].diastolicBP || '--'} mmHg</span> |
                      <span> Pulse: {p.vitals[p.vitals.length - 1].pulseRate || '--'} bpm</span> |
                      <span> Weight: {p.vitals[p.vitals.length - 1].weight || '--'} kg</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Workflow Tasks Section */}
        <section className="card">
          <h2>Clinical Tasks & Queue</h2>

          <form onSubmit={handleAddTask} className="form-stack">
            <input
              type="text"
              placeholder="Task / Consultation Request"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="Low">Low Priority (Routine)</option>
              <option value="Medium">Medium Priority (Standard)</option>
              <option value="High">High Priority (Urgent Triage)</option>
            </select>
            <select
              value={taskForm.assignedPatient}
              onChange={(e) => setTaskForm({ ...taskForm, assignedPatient: e.target.value })}
            >
              <option value="">-- Link to Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName}
                </option>
              ))}
            </select>
            <button type="submit">Assign Task</button>
          </form>

          {/* Filter & Sort Controls */}
          <div className="controls-bar">
            <div className="filter-tabs">
              {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>

          <div className="scroll-container">
            <ul className="item-list">
              {filteredTasks.length === 0 ? (
                <li className="empty-message">No tasks in this view.</li>
              ) : (
                filteredTasks.map((t) => (
                  <li key={t._id} className="list-item">
                    <div>
                      <strong>{t.title}</strong>
                      <p>
                        Priority: {t.priority}
                        {t.assignedPatient && ` | Patient: ${t.assignedPatient.fullName}`}
                      </p>
                    </div>
                    <div className="action-row">
                      <button
                        className={`status-btn ${t.status.toLowerCase().replace(' ', '-')}`}
                        onClick={() => handleCycleStatus(t)}
                      >
                        {t.status}
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDeleteTask(t._id)}>🗑️</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </main>

      {/* Vitals Triage Modal */}
      {selectedPatientForVitals && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Record Vitals: {selectedPatientForVitals.fullName}</h3>
            <p className="subtitle">Logged by Role: <strong>{userRole}</strong></p>

            <form onSubmit={handleAddVitals} className="form-stack">
              <div className="form-row">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Temperature (°C)"
                  required
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Pulse Rate (bpm)"
                  required
                  value={vitalsForm.pulseRate}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, pulseRate: e.target.value })}
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Systolic BP (mmHg)"
                  required
                  value={vitalsForm.systolicBP}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, systolicBP: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Diastolic BP (mmHg)"
                  required
                  value={vitalsForm.diastolicBP}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, diastolicBP: e.target.value })}
                />
              </div>

              <input
                type="number"
                step="0.1"
                placeholder="Weight (kg)"
                required
                value={vitalsForm.weight}
                onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
              />

              <div className="btn-group">
                <button type="submit">Save Vitals</button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedPatientForVitals(null)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h3>AfyaCRM Solutions Kenya</h3>
            <p>Empowering Kenyan Healthcare Facilities with Digital Workflows.</p>
          </div>
          <div className="footer-details">
            <p><strong>Support:</strong> derrickonyango20@gmail.com</p>
            <p><strong>System Status:</strong> Operational (v2.0.0 SHA-Enabled)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}