
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/components/auth/AuthContext";

import { motion } from "motion/react";
import { 
  AlertCircle, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  UserPlus, 
  Hospital, 
  Building2, 
  Stethoscope,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const EmergencyCard = ({ icon: Icon, title, description, contact, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-8 leading-relaxed flex-1">{description}</p>
    <a 
      href={`tel:${contact.replace(/\s/g, '')}`}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl font-bold group hover:bg-brand-accent hover:text-white transition-all"
    >
      <span className="text-sm">{contact}</span>
      <Phone className="w-4 h-4 transition-transform group-hover:rotate-12" />
    </a>
  </div>
);


export default function Emergency() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [iceData, setIceData] = useState({
    fullName: "",
    idNumber: "",
    studentNumber: "",
    nextOfKinName: "",
    nextOfKinContact: "",
    contact1: "",
    bloodType: "",
    allergies: "",
    medicalAidProvider: "",
    medicalAidNumber: "",
    primaryPhysicianName: "",
    primaryPhysicianContact: "",
    chronicConditions: ""
  });

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(d => {
        if (d.exists() && d.data().iceProfile) {
          setIceData({
            fullName: "",
            idNumber: "",
            studentNumber: "",
            nextOfKinName: "",
            nextOfKinContact: "",
            contact1: "",
            bloodType: "",
            allergies: "",
            medicalAidProvider: "",
            medicalAidNumber: "",
            primaryPhysicianName: "",
            primaryPhysicianContact: "",
            chronicConditions: "",
            ...d.data().iceProfile
          });
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { iceProfile: iceData }, { merge: true });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save ICE Profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Safety & Emergency</h1>
          <p className="text-gray-500">Quick access to emergency services, campus safety, and medical support.</p>
        </div>
        <button className="flex items-center gap-3 bg-brand-accent text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-brand-accent/20 animate-pulse">
          <AlertCircle className="w-6 h-6" />
          <span>EMERGENCY SOS</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <EmergencyCard 
          icon={ShieldAlert}
          title="Police Services"
          description="South African Police Service (SAPS) for immediate criminal assistance or safety concerns."
          contact="10111"
          color="bg-blue-50 text-blue-600"
        />
        <EmergencyCard 
          icon={Hospital}
          title="Ambulance"
          description="Emergency medical response for critical injuries, accidents, or sudden illness."
          contact="10177"
          color="bg-rose-50 text-rose-600"
        />
        <EmergencyCard 
          icon={AlertCircle}
          title="Universal Emergency"
          description="National emergency response number available from any mobile device, even without airtime."
          contact="112"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <UserPlus className="w-48 h-48 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Zap className="text-brand-primary" />
            ICE Profile (In Case of Emergency)
          </h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed max-w-md">
            Complete your emergency profile to ensure responders have critical medical information and contact details when every second counts.
          </p>
          <div className="space-y-4 mb-10">
            {isEditing ? (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={iceData.fullName} onChange={e => setIceData({...iceData, fullName: e.target.value})} placeholder="e.g. John Doe" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID Number</label>
                    <input type="text" value={iceData.idNumber} onChange={e => setIceData({...iceData, idNumber: e.target.value})} placeholder="National ID" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Number</label>
                    <input type="text" value={iceData.studentNumber} onChange={e => setIceData({...iceData, studentNumber: e.target.value})} placeholder="Student ID" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next of Kin Name</label>
                  <input type="text" value={iceData.nextOfKinName} onChange={e => setIceData({...iceData, nextOfKinName: e.target.value})} placeholder="e.g. Jane Doe (Mother)" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next of Kin Contact</label>
                  <input type="text" value={iceData.nextOfKinContact} onChange={e => setIceData({...iceData, nextOfKinContact: e.target.value})} placeholder="e.g. +27 82 123 4567" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alternative Contact</label>
                  <input type="text" value={iceData.contact1} onChange={e => setIceData({...iceData, contact1: e.target.value})} placeholder="Alternative Contact" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Medical Record</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical Aid Provider</label>
                    <input type="text" value={iceData.medicalAidProvider} onChange={e => setIceData({...iceData, medicalAidProvider: e.target.value})} placeholder="e.g. Discovery Health" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical Aid Number</label>
                    <input type="text" value={iceData.medicalAidNumber} onChange={e => setIceData({...iceData, medicalAidNumber: e.target.value})} placeholder="e.g. 123456789" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Physician Name</label>
                    <input type="text" value={iceData.primaryPhysicianName} onChange={e => setIceData({...iceData, primaryPhysicianName: e.target.value})} placeholder="e.g. Dr. Smith" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Physician Contact</label>
                    <input type="text" value={iceData.primaryPhysicianContact} onChange={e => setIceData({...iceData, primaryPhysicianContact: e.target.value})} placeholder="e.g. +27 11 123 4567" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blood Type</label>
                  <input type="text" value={iceData.bloodType} onChange={e => setIceData({...iceData, bloodType: e.target.value})} placeholder="e.g. O Positive" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Allergies</label>
                  <textarea value={iceData.allergies} onChange={e => setIceData({...iceData, allergies: e.target.value})} placeholder="e.g. Penicillin, Peanuts (Leave blank if none)" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold min-h-[80px] resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chronic Conditions</label>
                  <textarea value={iceData.chronicConditions} onChange={e => setIceData({...iceData, chronicConditions: e.target.value})} placeholder="e.g. Asthma, Diabetes (Leave blank if none)" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold min-h-[80px] resize-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {[
                  { label: "Full Name", value: iceData.fullName || "Not Set" },
                  { label: "ID Number", value: iceData.idNumber || "Not Set" },
                  { label: "Student Number", value: iceData.studentNumber || "Not Set" },
                  { label: "Next of Kin Name", value: iceData.nextOfKinName || "Not Set" },
                  { label: "Next of Kin Contact", value: iceData.nextOfKinContact || "Not Set" },
                  { label: "Alternative Contact", value: iceData.contact1 || "Not Set" },
                  { label: "Medical Aid Provider", value: iceData.medicalAidProvider || "Not Set" },
                  { label: "Medical Aid Number", value: iceData.medicalAidNumber || "Not Set" },
                  { label: "Primary Physician", value: iceData.primaryPhysicianName || "Not Set" },
                  { label: "Physician Contact", value: iceData.primaryPhysicianContact || "Not Set" },
                  { label: "Blood Type", value: iceData.bloodType || "Not Set" },
                  { label: "Allergies", value: iceData.allergies || "None" },
                  { label: "Chronic Conditions", value: iceData.chronicConditions || "None" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl gap-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className="w-1/2 bg-gray-100 text-gray-600 py-5 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="w-1/2 bg-brand-primary text-white py-5 rounded-2xl font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all">
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all">
              Update Emergency Profile
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <MapPin className="w-64 h-64" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Location Sharing</h3>
            <p className="text-sm text-white/70 mb-8 leading-relaxed">
              Enable secure location sharing with your trusted emergency contacts or campus safety team during a crisis.
            </p>
            <button className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all">
              Manage Permissions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:border-brand-primary/30 transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-800">Nearest Hospital</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center group cursor-pointer hover:border-brand-primary/30 transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-800">Nearest Pharmacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
