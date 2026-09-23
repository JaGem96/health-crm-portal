import { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Phase 2 State: Filtering & Sorting for Tasks
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Form states
  const [patientForm, setPatientForm] = useState({ fullName: '', email: '', phone: '', gender: 'Female' });
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'Medium', assignedPatient: '' });

  const fetchPatients = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/patients?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks');
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

  // Submit / Edit Patient
  const handleSavePatient = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingPatientId);
    const url = isEdit 
      ? `http://localhost:5000/api/patients/${editingPatientId}` 
      : 'http://localhost:5000/api/patients';
    
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      const data = await res.json();
      if (data.success) {
        setPatientForm({ fullName: '', email: '', phone: '', gender: 'Female' });
        setEditingPatientId(null);
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error saving patient:', err);
    }
  };

  const handleStartEdit = (patient) => {
    setEditingPatientId(patient._id);
    setPatientForm({
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender || 'Female'
    });
  };

  const handleCancelEdit = () => {
    setEditingPatientId(null);
    setPatientForm({ fullName: '', email: '', phone: '', gender: 'Female' });
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete this patient record?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  };

  // Submit Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
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
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' });
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
      const res = await fetch(`http://localhost:5000/api/tasks/${task._id}/status`, {
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
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="app-layout">
      <header className="navbar">
        <h1>Health CRM Operational Portal</h1>
      </header>

      {/* Analytics Summary Bar */}
      <section className="analytics-bar">
        <div className="stat-card">
          <span className="stat-label">Total Patients</span>
          <span className="stat-value">{totalPatients}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tasks</span>
          <span className="stat-value">{totalTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Tasks</span>
          <span className="stat-value warning">{pendingTasks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completion Rate</span>
          <span className="stat-value success">{completionRate}%</span>
        </div>
      </section>

      <main className="dashboard-grid">
        {/* Patients Section */}
        <section className="card">
          <h2>Patient Directory</h2>
          
          <input
            type="text"
            placeholder="Search patients by name or email..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <form onSubmit={handleSavePatient} className="form-stack">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={patientForm.fullName}
              onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={patientForm.email}
              onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
            />
            <div className="btn-group">
              <button type="submit">{editingPatientId ? 'Update Patient' : 'Add Patient'}</button>
              {editingPatientId && (
                <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Enclosed Scrollable List Container */}
          <div className="scroll-container">
            <ul className="item-list">
              {patients.map((p) => (
                <li key={p._id} className="list-item">
                  <div>
                    <strong>{p.fullName}</strong>
                    <p>{p.email} | {p.phone}</p>
                  </div>
                  <div className="action-row">
                    <span className={`badge ${p.status ? p.status.toLowerCase() : 'active'}`}>
                      {p.status || 'Active'}
                    </span>
                    <button className="btn-icon" onClick={() => handleStartEdit(p)}>✏️</button>
                    <button className="btn-icon danger" onClick={() => handleDeletePatient(p._id)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tasks Section */}
        <section className="card">
          <h2>Workflow Tasks</h2>

          <form onSubmit={handleAddTask} className="form-stack">
            <input
              type="text"
              placeholder="Task Title"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <select
              value={taskForm.assignedPatient}
              onChange={(e) => setTaskForm({ ...taskForm, assignedPatient: e.target.value })}
            >
              <option value="">-- Link to Patient (Optional) --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName}
                </option>
              ))}
            </select>
            <button type="submit">Create Task</button>
          </form>

          {/* Phase 2 Filter & Sort Controls */}
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

          {/* Enclosed Scrollable List Container */}
          <div className="scroll-container">
            <ul className="item-list">
              {filteredTasks.length === 0 ? (
                <li className="empty-message">No tasks found for this filter.</li>
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

      {/* Company Info Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h3>Health CRM Solutions Inc.</h3>
            <p>Empowering healthcare workflows and operational management.</p>
          </div>
          <div className="footer-details">
            <p><strong>Support:</strong> derrickonyango20@gmail.com</p>
            <p><strong>System Status:</strong> Operational (v1.2.0)</p>
            <p><strong>Address:</strong> Kisumu, Kenya</p>
            <p><strong>Since:</strong> 2015</p>
          </div>
        </div>
      </footer>
    </div>
  );
}