/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Activity, 
  Settings, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  ExternalLink,
  Download,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Screen = 'DASHBOARD' | 'LOADING' | 'SUMMARY' | 'DRILLDOWN' | 'ACTIVE_SUMMARIES';

interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F';
  department: string;
  primaryDiagnosis: string;
  attending: string;
  lastEncounter: string;
}

interface ActiveSummary {
  id: string;
  patientId: string;
  name: string;
  mrn: string;
  timestamp: string;
  context: string;
  status: 'Reviewed' | 'Pending Review' | 'Flagged';
}

interface FlaggedSummary {
  id: string;
  patientId: string;
  name: string;
  mrn: string;
  reason: string;
  icon: React.ReactNode;
}

interface ActivityLog {
  id: string;
  action: string;
  mrn: string;
  timestamp: string;
}

// --- Mock Data ---

const SAMPLE_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    mrn: 'MRN-88291',
    age: 64,
    sex: 'F',
    department: 'Cardiology',
    primaryDiagnosis: 'Congestive Heart Failure',
    attending: 'Dr. Marcus Thorne',
    lastEncounter: 'Mar 15, 2026'
  },
  {
    id: '2',
    name: 'Robert Miller',
    mrn: 'MRN-44102',
    age: 52,
    sex: 'M',
    department: 'Internal Medicine',
    primaryDiagnosis: 'Type 2 Diabetes Mellitus',
    attending: 'Dr. Sarah Vance',
    lastEncounter: 'Apr 02, 2026'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    mrn: 'MRN-11938',
    age: 71,
    sex: 'F',
    department: 'Oncology',
    primaryDiagnosis: 'Stage III Breast Cancer',
    attending: 'Dr. James Lee',
    lastEncounter: 'Mar 28, 2026'
  }
];

const ACTIVE_SUMMARIES_DATA: ActiveSummary[] = [
  {
    id: 'as1',
    patientId: '1',
    name: 'Sarah Jenkins',
    mrn: 'MRN-88291',
    timestamp: 'April 9, 2026 at 08:42 AM',
    context: 'Cardiology Referral',
    status: 'Reviewed'
  },
  {
    id: 'as2',
    patientId: '2',
    name: 'Robert Miller',
    mrn: 'MRN-44102',
    timestamp: 'April 9, 2026 at 10:15 AM',
    context: 'Routine Follow-up',
    status: 'Pending Review'
  },
  {
    id: 'as3',
    patientId: '3',
    name: 'Elena Rodriguez',
    mrn: 'MRN-11938',
    timestamp: 'April 8, 2026 at 04:30 PM',
    context: 'Oncology Assessment',
    status: 'Flagged'
  }
];

const FLAGGED_SUMMARIES_DATA: FlaggedSummary[] = [
  {
    id: 'fs1',
    patientId: '1',
    name: 'Sarah Jenkins',
    mrn: 'MRN-88291',
    reason: 'Detected data gaps (missing lab results in the last 90 days)',
    icon: <Database className="w-4 h-4 text-amber-500" />
  },
  {
    id: 'fs2',
    patientId: '3',
    name: 'Elena Rodriguez',
    mrn: 'MRN-11938',
    reason: 'High-risk keywords detected ("acute MI")',
    icon: <AlertTriangle className="w-4 h-4 text-rose-500" />
  }
];

const ACTIVITY_LOG_DATA: ActivityLog[] = [
  { id: 'l1', action: 'Summary viewed', mrn: '004821', timestamp: 'April 9, 2026, 09:15 AM' },
  { id: 'l2', action: 'Summary exported', mrn: '007732', timestamp: 'April 9, 2026, 08:50 AM' },
  { id: 'l3', action: 'Summary regenerated', mrn: '003391', timestamp: 'April 9, 2026, 07:30 AM' }
];

// --- Components ---

const Navbar = ({ user, currentScreen, onNavigate }: { user: string, currentScreen: Screen, onNavigate: (s: Screen) => void }) => (
  <nav className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>
      <div className="bg-blue-600 p-1.5 rounded-lg">
        <Activity className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight text-slate-900">NoteSummary <span className="text-blue-600">AI</span></span>
    </div>
    <div className="flex items-center gap-8">
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className={`${currentScreen === 'DASHBOARD' ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'hover:text-slate-900 transition-colors'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => onNavigate('ACTIVE_SUMMARIES')}
          className={`${currentScreen === 'ACTIVE_SUMMARIES' ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'hover:text-slate-900 transition-colors'}`}
        >
          Active Summaries
        </button>
        <button className="hover:text-slate-900 transition-colors">Settings</button>
      </div>
      <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{user}</p>
          <p className="text-xs text-slate-500">Internal Medicine</p>
        </div>
        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
          <User className="w-5 h-5 text-slate-600" />
        </div>
      </div>
    </div>
  </nav>
);

const Banner = () => (
  <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-2 text-amber-800 text-xs font-medium">
    <AlertTriangle className="w-3.5 h-3.5" />
    <span>⚠️ NoteSummary AI outputs are decision-support tools only. Always verify against source documentation.</span>
  </div>
);

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [isReviewingFlagged, setIsReviewingFlagged] = useState(false);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentScreen('LOADING');
    setLoadingStep(0);
    setIsReviewingFlagged(false);
  };

  const handleViewSummary = (patientId: string) => {
    const patient = SAMPLE_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCurrentScreen('SUMMARY');
      setIsReviewingFlagged(false);
    }
  };

  const handleRegenerate = (patientId: string) => {
    const patient = SAMPLE_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCurrentScreen('LOADING');
      setLoadingStep(0);
      setIsReviewingFlagged(false);
    }
  };

  const handleReviewFlagged = (patientId: string) => {
    const patient = SAMPLE_PATIENTS.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCurrentScreen('SUMMARY');
      setIsReviewingFlagged(true);
    }
  };

  useEffect(() => {
    if (currentScreen === 'LOADING') {
      const timer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= 2) {
            clearInterval(timer);
            setTimeout(() => setCurrentScreen('SUMMARY'), 800);
            return 2;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [currentScreen]);

  const filteredPatients = SAMPLE_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <Navbar user="Dr. A. Chen" currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <Banner />

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {currentScreen === 'DASHBOARD' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="max-w-2xl mx-auto text-center space-y-4 py-12">
                <h1 className="text-3xl font-bold text-slate-900">Patient Lookup</h1>
                <p className="text-slate-500">Search the EHR database to generate an AI-powered clinical summary.</p>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search patient by name or MRN..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{patient.name}</h3>
                          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{patient.mrn}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Age / Sex</p>
                          <p className="font-medium">{patient.age} / {patient.sex}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Department</p>
                          <p className="font-medium">{patient.department}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === 'LOADING' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-12"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
              </div>
              
              <div className="space-y-6 w-full max-w-md">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Generating Summary for {selectedPatient?.name}</h2>
                  <p className="text-slate-500 text-sm">Synthesizing fragmented EHR data into clinical insights...</p>
                </div>

                <div className="space-y-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  {[
                    "NLP entity extraction — diagnoses, medications, procedures, lab values detected",
                    "ML relevance ranking — prioritizing clinically significant findings",
                    "RAG source linking — all insights linked to original EHR documentation"
                  ].map((step, idx) => (
                    <div key={idx} className={`flex items-center gap-3 transition-opacity duration-500 ${loadingStep >= idx ? 'opacity-100' : 'opacity-30'}`}>
                      {loadingStep > idx ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : loadingStep === idx ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-200 rounded-full shrink-0"></div>
                      )}
                      <span className="text-sm font-medium">{loadingStep >= idx ? '✅ ' : ''}{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'SUMMARY' && selectedPatient && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setCurrentScreen('DASHBOARD')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Export Summary
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('DRILLDOWN')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    Drill Down into Full Notes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel A: Snapshot */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <User className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                      <p className="text-sm text-slate-500">{selectedPatient.age}y {selectedPatient.sex} • {selectedPatient.mrn}</p>
                    </div>
                  </div>
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Primary Diagnosis</p>
                      <p className="font-semibold text-blue-700">{selectedPatient.primaryDiagnosis}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Attending Physician</p>
                      <p className="font-semibold">{selectedPatient.attending}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Last Encounter</p>
                      <p className="font-semibold">{selectedPatient.lastEncounter}</p>
                    </div>
                  </div>
                </div>

                {/* Panel B: Timeline */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Interactive Clinical Timeline
                    </h3>
                  </div>
                  <div className="relative py-8 px-4">
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100"></div>
                    <div className="flex justify-between relative">
                      {[
                        { date: 'Jan 2024', event: 'Initial Dx', type: 'DIAGNOSIS' },
                        { date: 'Feb 2024', event: 'Meds Started', type: 'MEDICATION' },
                        { date: 'Oct 2025', event: 'Hospitalization', type: 'ADMISSION' },
                        { date: 'Mar 2026', event: 'Follow-up', type: 'ENCOUNTER' }
                      ].map((node, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 relative">
                          <div className="bg-white border-2 border-blue-600 w-4 h-4 rounded-full z-10 shadow-[0_0_0_4px_white]"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{node.date}</p>
                            <p className="text-xs font-semibold">{node.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">📄 Source: Longitudinal EHR Record (2024-2026) | Linked to original documentation</p>
                </div>

                {/* Panel C: Problems */}
                <div className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 transition-all ${isReviewingFlagged ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`}>
                  <h3 className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Active Problems & Diagnoses
                    </span>
                    {isReviewingFlagged && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: selectedPatient.primaryDiagnosis, tag: 'PRIMARY', color: 'blue' },
                      { name: 'Hypertension', tag: 'ACTIVE', color: 'slate' },
                      { name: 'Hyperlipidemia', tag: 'ACTIVE', color: 'slate' },
                      { name: 'Pneumonia (2023)', tag: 'HISTORICAL', color: 'slate' }
                    ].map((prob, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium">{prob.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          prob.tag === 'PRIMARY' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                          prob.tag === 'ACTIVE' ? 'bg-slate-50 border-slate-200 text-slate-600' : 
                          'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {prob.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">📄 Source: Problem List & Assessment Notes | Updated Mar 15, 2026</p>
                </div>

                {/* Panel D: Medications */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Medications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Lisinopril', dose: '20mg Daily', start: 'Jan 2024', changed: false },
                      { name: 'Furosemide', dose: '40mg BID', start: 'Mar 2026', changed: true },
                      { name: 'Metoprolol', dose: '25mg Daily', start: 'Feb 2024', changed: false }
                    ].map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {med.name}
                            {med.changed && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin-slow" />}
                          </p>
                          <p className="text-[10px] text-slate-500">{med.dose} • Started {med.start}</p>
                        </div>
                        {med.changed && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">RECENT CHANGE</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">📄 Source: Medication Administration Record (MAR) | Verified Apr 02, 2026</p>
                </div>

                {/* Panel E: Recent Labs */}
                <div className={`lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm space-y-4 transition-all ${isReviewingFlagged ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'}`}>
                  <h3 className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-500" />
                      Recent Labs & Flags (90 Days)
                    </span>
                    {isReviewingFlagged && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-2 font-bold">Test</th>
                          <th className="pb-2 font-bold">Value</th>
                          <th className="pb-2 font-bold">Ref Range</th>
                          <th className="pb-2 font-bold">Date</th>
                          <th className="pb-2 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { test: 'BNP', val: '450 pg/mL', ref: '< 100 pg/mL', date: 'Mar 15', flag: true },
                          { test: 'Creatinine', val: '1.2 mg/dL', ref: '0.7-1.3 mg/dL', date: 'Mar 15', flag: false },
                          { test: 'Sodium', val: '132 mEq/L', ref: '135-145 mEq/L', date: 'Mar 15', flag: true },
                          { test: 'Potassium', val: '4.1 mEq/L', ref: '3.5-5.0 mEq/L', date: 'Mar 15', flag: false }
                        ].map((lab, i) => (
                          <tr key={i} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-medium">{lab.test}</td>
                            <td className={`py-3 font-bold ${lab.flag ? 'text-rose-600' : 'text-slate-900'}`}>{lab.val}</td>
                            <td className="py-3 text-slate-500 text-xs">{lab.ref}</td>
                            <td className="py-3 text-slate-500 text-xs">{lab.date}</td>
                            <td className="py-3 text-right">
                              {lab.flag && <AlertTriangle className="w-4 h-4 text-rose-500 inline" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">📄 Source: Lab Results – Core Laboratory | Mar 15, 2026</p>
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'DRILLDOWN' && selectedPatient && (
            <motion.div 
              key="drilldown"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setCurrentScreen('SUMMARY')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Summary
                </button>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Database className="w-3 h-3" />
                  RAG Source Linking Active
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">AI-Generated Insight</h3>
                  <div className="flex-1 space-y-6">
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl">
                      <p className="text-lg font-semibold text-blue-900">Troponin elevated — possible ACS</p>
                      <p className="text-sm text-blue-700 mt-2">Detected in Mar 15 lab results and corroborated by nursing notes regarding chest discomfort.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supporting Evidence</p>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>Troponin I: 0.45 ng/mL (Ref: &lt;0.04)</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>Patient reported "pressure in chest" at 04:30 AM</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col text-slate-300 font-mono text-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Raw EHR Note Excerpt</h3>
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded">ID: NOTE-99281-X</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 leading-relaxed">
                    <p>DATE: 2026-03-15 05:12</p>
                    <p>AUTHOR: RN K. Miller</p>
                    <p>---</p>
                    <p>Patient called via call light at 04:30. Complaining of <span className="bg-blue-500/30 text-blue-200 px-1 rounded ring-1 ring-blue-500/50">[substernal chest pressure, rated 6/10]</span>. Denies radiation to left arm. Diaphoretic. Vitals: BP 142/88, HR 92, SpO2 94% on RA.</p>
                    <p>Stat labs ordered per protocol. <span className="bg-blue-500/30 text-blue-200 px-1 rounded ring-1 ring-blue-500/50">[Troponin I resulted at 0.45]</span> at 05:05. Dr. Thorne notified. EKG pending.</p>
                    <p>---</p>
                    <p className="text-slate-500 italic text-xs">Note: This is a simulated excerpt demonstrating the RAG traceability feature. All highlighted text directly supports the AI insight on the left.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'ACTIVE_SUMMARIES' && (
            <motion.div 
              key="active_summaries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 pb-20"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Active Summaries — Dr. A. Chen | Internal Medicine</h1>
                <p className="text-slate-500 text-sm">Summaries generated in the last 48 hours. All outputs are assistive tools only.</p>
              </div>

              {/* Section A: Recently Generated */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recently Generated Summaries
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ACTIVE_SUMMARIES_DATA.map((summary) => (
                    <div key={summary.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900">{summary.name}</h3>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{summary.mrn}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 ${
                          summary.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          summary.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            summary.status === 'Reviewed' ? 'bg-emerald-500' :
                            summary.status === 'Pending Review' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}></div>
                          {summary.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-500">Generated: <span className="text-slate-900 font-medium">{summary.timestamp}</span></p>
                        <p className="text-slate-500">Context: <span className="text-slate-900 font-medium">{summary.context}</span></p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button 
                          onClick={() => handleViewSummary(summary.patientId)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Summary
                        </button>
                        <button 
                          onClick={() => handleRegenerate(summary.patientId)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section B: Flagged Summaries */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                  Flagged Summaries
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {FLAGGED_SUMMARIES_DATA.map((flagged) => (
                    <div key={flagged.id} className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                          {flagged.icon}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900">{flagged.name} <span className="text-xs font-mono text-slate-400 ml-2">{flagged.mrn}</span></h3>
                          <p className="text-sm text-rose-700 font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {flagged.reason}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleReviewFlagged(flagged.patientId)}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm whitespace-nowrap"
                      >
                        Review Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section C: Activity Log */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Summary Activity Log
                </h2>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {ACTIVITY_LOG_DATA.map((log) => (
                      <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600">
                            <span className="font-bold text-slate-900">{log.action}</span> — Patient MRN {log.mrn}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Audit trail active. Supports PHIPA compliance and clinical accountability.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[10px] text-slate-400 font-medium z-40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Decision Support Mode
          </span>
          <span>v2.4.0-stable</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              alert("NoteSummary AI Pipeline:\n1. NLP: Extracts entities (RxNorm, ICD-10, LOINC)\n2. ML: Ranks findings by specialty relevance\n3. RAG: Maps insights back to specific EHR note segments for verification.");
            }}
            className="hover:text-slate-900 transition-colors"
          >
            How does this work?
          </button>
          <span>© 2026 NoteSummary AI Systems</span>
        </div>
      </footer>
    </div>
  );
}
