import React, { useState, useEffect } from 'react';
import { Clock, UserRound, Users, PlusCircle, Stethoscope } from 'lucide-react';
import type { Patient, Doctor } from './types';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. Smith', specialty: 'General', available: true, currentPatient: null },
    { id: '2', name: 'Dr. Johnson', specialty: 'General', available: true, currentPatient: null },
    { id: '3', name: 'Dr. Williams', specialty: 'General', available: true, currentPatient: null },
  ]);
  const [newPatient, setNewPatient] = useState({ name: '', estimatedDuration: 15 });
  const [timeQuantum] = useState(10); // minutes
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      processQueue();
    }, 1000);
    return () => clearInterval(timer);
  }, [patients, doctors]);

  const addPatient = () => {
    if (!newPatient.name) return;
    
    const patient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPatient.name,
      priority: 1,
      arrivalTime: new Date(),
      estimatedDuration: newPatient.estimatedDuration,
      status: 'waiting'
    };

    setPatients(prev => [...prev, patient]);
    setNewPatient({ name: '', estimatedDuration: 15 });
  };

  const processQueue = () => {
    // Find available doctors
    const availableDoctors = doctors.filter(d => d.available || 
      (d.currentPatient && (patients.find(p => p.id === d.currentPatient)?.estimatedDuration ?? 0) <= 0));

    if (availableDoctors.length === 0) return;

    // Get waiting patients
    const waitingPatients = patients.filter(p => p.status === 'waiting');
    if (waitingPatients.length === 0) return;

    // Assign patients to available doctors using round-robin
    availableDoctors.forEach(doctor => {
      const nextPatient = waitingPatients.shift();
      if (!nextPatient) return;

      setDoctors(prev => prev.map(d => 
        d.id === doctor.id ? { ...d, currentPatient: nextPatient.id, available: false } : d
      ));

      setPatients(prev => prev.map(p => 
        p.id === nextPatient.id ? { ...p, status: 'in-progress' } : p
      ));
    });

    // Update remaining time for in-progress patients
    setPatients(prev => prev.map(p => {
      if (p.status === 'in-progress') {
        const newDuration = p.estimatedDuration - 1;
        if (newDuration <= 0) {
          // Free up the doctor
          setDoctors(prev => prev.map(d => 
            d.currentPatient === p.id ? { ...d, currentPatient: null, available: true } : d
          ));
          return { ...p, status: 'completed', estimatedDuration: 0 };
        }
        return { ...p, estimatedDuration: newDuration };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hospital Queue System</h1>
          <div className="flex items-center justify-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Add Patient Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Patient Name"
              className="flex-1 p-2 border rounded"
              value={newPatient.name}
              onChange={e => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Est. Duration (min)"
              className="w-32 p-2 border rounded"
              value={newPatient.estimatedDuration}
              onChange={e => setNewPatient(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 15 }))}
            />
            <button
              onClick={addPatient}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Doctors Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2" />
              Doctors Status
            </h2>
            <div className="space-y-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        doctor.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.available ? 'Available' : 'Busy'}
                      </span>
                      {doctor.currentPatient && (
                        <p className="text-sm text-gray-600 mt-1">
                          Current: {patients.find(p => p.id === doctor.currentPatient)?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Queue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Patient Queue
            </h2>
            <div className="space-y-4">
              {patients.filter(p => p.status !== 'completed').map(patient => (
                <div key={patient.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <UserRound className="w-5 h-5 mr-2 text-gray-500" />
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-gray-600">
                          Waiting since: {patient.arrivalTime.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        patient.status === 'waiting' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {patient.status === 'waiting' ? 'Waiting' : 'In Progress'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Est. time: {patient.estimatedDuration} min
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {patients.filter(p => p.status !== 'completed').length === 0 && (
                <p className="text-gray-500 text-center py-4">No patients in queue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;