import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://health-crm-portal-heb8.onrender.com';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // For Vitals Modal

  // Forms
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    phone: '',
    gender: 'Female',
    insuranceProvider: 'SHA/NHIF',
    shaNumber: '',
    claimStatus: 'Pending',
    preAuthCode: ''
  });

  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    systolicBP: '',
    diastolicBP: '',
    pulseRate: '',
    weight: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    priority: 'Medium',
    assignedPatient: ''
  });

  // Load Data
  useEffect(() => {
    fetchPatients();
    fetchTasks();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  // Register Patient
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      const data = await res.json();
      if (data.success) {
        setPatientForm({
          fullName: '',
          phone: '',
          gender: 'Female',
          insuranceProvider: 'SHA/NHIF',
          shaNumber: '',
          claimStatus: 'Pending',
          preAuthCode: ''
        });
        fetchPatients();
      }
    } catch (err) {
      console.error('Error registering patient:', err);
    }
  };

  // Submit Vitals for Patient
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${selectedPatient._id}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsForm)
      });
      const data = await res.json();
      if (data.success) {
        setVitalsForm({ temperature: '', systolicBP: '', diastolicBP: '', pulseRate: '', weight: '' });
        setSelectedPatient(null);
        fetchPatients();
      }
    } catch (err) {
      console.error('Error saving vitals:', err);
    }
  };

  // Create Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: taskForm.title,
        priority: taskForm.priority,
        ...(taskForm.assignedPatient ? { assignedPatient: taskForm.assignedPatient } : {})
      };
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>AfyaCRM Clinical Portal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* PATIENT REGISTRATION */}
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2>Patient Directory & SHA/NHIF Tracking</h2>
          <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              placeholder="Full Name" 
              value={patientForm.fullName} 
              onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })} 
              required 
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                placeholder="Phone Number (+254)" 
                value={patientForm.phone} 
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} 
                required 
              />
              <select 
                value={patientForm.gender} 
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={patientForm.insuranceProvider} 
                onChange={(e) => setPatientForm({ ...patientForm, insuranceProvider: e.target.value })}
              >
                <option value="SHA/NHIF">SHA / NHIF Provider</option>
                <option value="Private">Private Cover</option>
                <option value="Self-Pay">Self-Pay</option>
              </select>
              <input 
                placeholder="SHA/NHIF Card No." 
                value={patientForm.shaNumber} 
                onChange={(e) => setPatientForm({ ...patientForm, shaNumber: e.target.value })} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={patientForm.claimStatus} 
                onChange={(e) => setPatientForm({ ...patientForm, claimStatus: e.target.value })}
              >
                <option value="Pending">Claim: Pending Approval</option>
                <option value="Approved">Claim: Approved</option>
                <option value="Rejected">Claim: Rejected</option>
              </select>
              <input 
                placeholder="Pre-Auth Code (If approved)" 
                value={patientForm.preAuthCode} 
                onChange={(e) => setPatientForm({ ...patientForm, preAuthCode: e.target.value })} 
              />
            </div>

            <button type="submit" style={{ padding: '10px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Register Patient
            </button>
          </form>

          {/* PATIENT LIST */}
          <div style={{ marginTop: '20px' }}>
            <h3>Registered Patients ({patients.length})</h3>
            {patients.map((p) => (
              <div key={p._id} style={{ background: '#fff', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <strong>{p.fullName}</strong> ({p.gender})<br/>
                <small>{p.phone} | Provider: {p.insuranceProvider}</small><br/>
                {p.shaNumber && <small>SHA No: {p.shaNumber} | Pre-Auth: {p.preAuthCode || 'N/A'}</small>}<br/>
                
                {/* Vitals Summary */}
                {p.vitals && p.vitals.length > 0 && (
                  <div style={{ background: '#eef7ff', padding: '5px', borderRadius: '4px', marginTop: '5px' }}>
                    <small>
                      <strong>Latest Vitals:</strong> {p.vitals[p.vitals.length - 1].systolicBP}/{p.vitals[p.vitals.length - 1].diastolicBP} mmHg | 
                      {' '}{p.vitals[p.vitals.length - 1].temperature}°C | {p.vitals[p.vitals.length - 1].pulseRate} bpm
                    </small>
                  </div>
                )}

                <button 
                  onClick={() => setSelectedPatient(p)} 
                  style={{ marginTop: '5px', padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  + Record Triage Vitals
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CLINICAL TASKS */}
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2>Clinical Tasks & Queue</h2>
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              placeholder="Task / Consultation Request" 
              value={taskForm.title} 
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} 
              required 
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
                <option key={p._id} value={p._id}>{p.fullName}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '10px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Assign Task
            </button>
          </form>

          {/* TASK LIST */}
          <div style={{ marginTop: '20px' }}>
            <h3>Current Tasks ({tasks.length})</h3>
            {tasks.map((t) => (
              <div key={t._id} style={{ background: '#fff', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <strong>{t.title}</strong> - <small>[{t.priority} Priority]</small><br/>
                {t.assignedPatient && <small>Patient: {t.assignedPatient.fullName}</small>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRIAGE VITALS MODAL */}
      {selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Log Triage Vitals: {selectedPatient.fullName}</h3>
            <form onSubmit={handleSaveVitals} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                placeholder="Temperature (°C)" 
                type="number" step="0.1" 
                value={vitalsForm.temperature} 
                onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  placeholder="Systolic BP" 
                  type="number" 
                  value={vitalsForm.systolicBP} 
                  onChange={(e) => setVitalsForm({ ...vitalsForm, systolicBP: e.target.value })} 
                  required 
                />
                <input 
                  placeholder="Diastolic BP" 
                  type="number" 
                  value={vitalsForm.diastolicBP} 
                  onChange={(e) => setVitalsForm({ ...vitalsForm, diastolicBP: e.target.value })} 
                  required 
                />
              </div>
              <input 
                placeholder="Pulse Rate (bpm)" 
                type="number" 
                value={vitalsForm.pulseRate} 
                onChange={(e) => setVitalsForm({ ...vitalsForm, pulseRate: e.target.value })} 
                required 
              />
              <input 
                placeholder="Weight (kg)" 
                type="number" step="0.1" 
                value={vitalsForm.weight} 
                onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Save Vitals
                </button>
                <button type="button" onClick={() => setSelectedPatient(null)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}