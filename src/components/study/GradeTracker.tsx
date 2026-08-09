import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";

interface Grade {
  id: string;
  subject: string;
  type: string;
  score: number;
  date: number;
}

export default function GradeTracker() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("Assignment");
  const [score, setScore] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "grades"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGrades(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Grade)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "grades");
    });
    return unsubscribe;
  }, []);

  const addGrade = async () => {
    if (!subject || !score || !auth.currentUser) return;
    await addDoc(collection(db, "grades"), {
      userId: auth.currentUser.uid,
      subject,
      type,
      score: Number(score),
      date: Date.now(),
    });
    setSubject("");
    setScore("");
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Grade Tracker</h2>
      <div className="flex gap-2 mb-4">
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="p-2 border rounded-lg flex-1" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded-lg">
          <option>Assignment</option>
          <option>Test</option>
          <option>Exam</option>
        </select>
        <input placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} className="p-2 border rounded-lg w-20" type="number" />
        <button onClick={addGrade} className="px-4 py-2 bg-brand-primary text-white rounded-lg">Add</button>
      </div>
      <div className="space-y-2">
        {grades.map((grade) => (
          <div key={grade.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span>{grade.subject} ({grade.type})</span>
            <span className="font-bold">{grade.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
