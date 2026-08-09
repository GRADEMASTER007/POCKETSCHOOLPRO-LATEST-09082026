import { appCheck } from "@/src/lib/firebase";
import { getToken } from "firebase/app-check";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Upload, 
  Search, 
  File, 
  MoreVertical, 
  Download, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  FilePlus,
  Compass
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/components/auth/AuthContext";
import ReactMarkdown from "react-markdown";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
}

function extractTextFromGoogleDoc(docObj: any): string {
  if (!docObj || !docObj.body || !docObj.body.content) return "";
  let text = "";
  for (const element of docObj.body.content) {
    if (element.paragraph && element.paragraph.elements) {
      for (const el of element.paragraph.elements) {
        if (el.textRun && el.textRun.content) {
          text += el.textRun.content;
        }
      }
    }
  }
  return text;
}

const DocumentSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50/50">
          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Modified</th>
          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {[1, 2, 3].map((n) => (
          <tr key={n} className="animate-pulse">
            <td className="px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-md w-36" />
                  <div className="h-3 bg-gray-200/60 rounded-md w-16" />
                </div>
              </div>
            </td>
            <td className="px-8 py-4">
              <div className="h-4 bg-gray-200 rounded-md w-24" />
            </td>
            <td className="px-8 py-4">
              <div className="h-4 bg-gray-200 rounded-md w-20" />
            </td>
            <td className="px-8 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AIAnalysisSkeleton = () => (
  <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 animate-pulse space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-4 h-4 bg-brand-primary/20 rounded-full animate-ping" />
      <div className="h-4 bg-gray-200 rounded-md w-48" />
    </div>
    <div className="space-y-2.5">
      <div className="h-3 bg-gray-200 rounded-md w-full" />
      <div className="h-3 bg-gray-200 rounded-md w-11/12" />
      <div className="h-3 bg-gray-200 rounded-md w-5/6" />
    </div>
    <div className="h-px bg-gray-200/50 my-4" />
    <div className="space-y-2.5">
      <div className="h-3 bg-gray-200 rounded-md w-full" />
      <div className="h-3 bg-gray-200 rounded-md w-10/12" />
    </div>
  </div>
);

export default function DocumentCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, googleAccessToken, connectGoogle } = useAuth();
  
  const [googleFiles, setGoogleFiles] = useState<GoogleFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState("");
  const [firestoreDocs, setFirestoreDocs] = useState<any[]>([]);

  // Sync seeded OER materials from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, "documents"), where("userId", "==", uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFirestoreDocs(docs);
    }, (error) => {
      console.warn("Error listening to database documents:", error);
    });
    return unsubscribe;
  }, []);
  
  // Create doc form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [creatingDoc, setCreatingDoc] = useState(false);
  
  // Selected doc details / AI analysis simulation
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  // New state for file upload and paste text features
  const [localUploadedFiles, setLocalUploadedFiles] = useState<any[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files when Google Token changes or is available
  useEffect(() => {
    if (googleAccessToken) {
      handleFetchDriveFiles();
    }
  }, [googleAccessToken]);

  const handleFetchDriveFiles = async () => {
    setLoadingFiles(true);
    setFilesError("");
    try {
      // Query Cloud Drive for documents, spreadsheets, presentations, and forms
      const q = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.form'");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink,modifiedTime,size)&pageSize=30`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setGoogleFiles(data.files || []);
      } else {
        const err = await res.json();
        console.error("Drive API Error:", err);
        setFilesError("Failed to fetch Cloud Drive files. Please verify authorization.");
      }
    } catch (err) {
      console.error(err);
      setFilesError("Network error while connecting to Cloud Drive.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    await connectGoogle();
  };

  const handleCreateGoogleDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !googleAccessToken) return;

    setCreatingDoc(true);
    try {
      // 1. Create document using Documents API
      const res = await fetch("https://docs.googleapis.com/v1/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newDocTitle.trim()
        })
      });

      if (res.ok) {
        const docData = await res.json();
        alert(`🎉 Documentument "${newDocTitle}" successfully created!`);
        setNewDocTitle("");
        setShowCreateModal(false);
        // Refresh drive listing
        await handleFetchDriveFiles();
      } else {
        const err = await res.json();
        console.error("Docs API Error:", err);
        alert("Failed to create Document. Ensure Docs scope is active.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred while creating Documentument.");
    } finally {
      setCreatingDoc(false);
    }
  };

  const runAIAnalyze = async (title: string, content: string) => {
    setAnalyzing(true);
    setAiAnalysisResult("");
    try {
      const response = await fetch("/api/summarize-document", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`},
        body: JSON.stringify({ title, content, userId: user?.uid })
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysisResult(data.summary || "No summary returned.");
      } else {
        const err = await response.json();
        setAiAnalysisResult(`⚠️ Error analyzing document: ${err.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      setAiAnalysisResult("⚠️ Network error occurred while contacting the AI server.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAIAnalyze = async (doc: any) => {
    setSelectedDoc(doc);
    setAnalyzing(true);
    setAiAnalysisResult("");

    let docContent = "";
    
    // 1. If it's a locally uploaded file or pasted text, it has pre-loaded content
    if (doc.content) {
      docContent = doc.content;
    } 
    // 2. If it's a Document from Drive, fetch its real text content
    else if (doc.mimeType === "application/vnd.google-apps.document" && googleAccessToken) {
      try {
        const res = await fetch(`https://docs.googleapis.com/v1/documents/${doc.id}`, {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });
        if (res.ok) {
          const docData = await res.json();
          docContent = extractTextFromGoogleDoc(docData);
          if (!docContent.trim()) {
            docContent = "This Documentument appears to be empty.";
          }
        } else {
          docContent = "Failed to load document content from Cloud Drive. Ensure you have the proper access permissions.";
        }
      } catch (err) {
        console.error("Failed to fetch Document text:", err);
        docContent = "Error fetching document text from Cloud Drive.";
      }
    } 
    // 3. Default fallback if content cannot be read (e.g. other Drive binary files)
    else {
      docContent = `Study materials for "${doc.name}". This is a binary or non-text file type (${formatMimeType(doc.mimeType)}), but here is a study guide analysis based on its title and metadata: "${doc.name}" is a critical curriculum resource. Please review its key chapters, definitions, and complete the accompanying practice sets.`;
    }

    await runAIAnalyze(doc.name, docContent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const textContent = event.target?.result as string;
      if (textContent) {
        const uploadedDoc = {
          id: "upload_" + Date.now(),
          name: file.name,
          mimeType: file.type || "text/plain",
          content: textContent,
          size: (file.size / 1024).toFixed(1) + " KB",
          modifiedTime: new Date().toISOString()
        };
        
        setLocalUploadedFiles(prev => [uploadedDoc, ...prev]);
        setSelectedDoc(uploadedDoc);
        await runAIAnalyze(uploadedDoc.name, textContent);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteContent.trim()) return;
    
    const pastedDoc = {
      id: "paste_" + Date.now(),
      name: pasteTitle.trim() || "Pasted Material",
      mimeType: "text/plain",
      content: pasteContent,
      size: (pasteContent.length / 1024).toFixed(1) + " KB",
      modifiedTime: new Date().toISOString()
    };
    
    setLocalUploadedFiles(prev => [pastedDoc, ...prev]);
    setSelectedDoc(pastedDoc);
    setShowPasteModal(false);
    setPasteTitle("");
    setPasteContent("");
    
    await runAIAnalyze(pastedDoc.name, pastedDoc.content);
  };

  // Helper to resolve Icons based on MIME-type
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="w-5 h-5" />;
    if (mimeType.includes("document")) return <FileText className="w-5 h-5 text-indigo-500" />;
    if (mimeType.includes("spreadsheet")) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (mimeType.includes("form")) return <Compass className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatMimeType = (mimeType?: string) => {
    if (!mimeType) return "Unknown File";
    if (mimeType.includes("document")) return "Document";
    if (mimeType.includes("spreadsheet")) return "Spreadsheet";
    if (mimeType.includes("form")) return "Form";
    return "Drive File";
  };

  // Search filtered docs including locally uploaded/pasted files
  const displayedDocs = (() => {
    const baseDocs = googleAccessToken && googleFiles.length > 0 
      ? googleFiles 
      : [
          ...firestoreDocs.map(fd => ({
            id: fd.id,
            name: fd.name,
            mimeType: fd.mimeType || "text/plain",
            modifiedTime: fd.modifiedTime,
            size: fd.size || "1.5 MB",
            content: fd.content,
            webViewLink: fd.webViewLink
          }))
        ];
    
    // Put uploaded files at the beginning of the list
    const combined = [...localUploadedFiles, ...baseDocs];
    return combined.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Document Center</h1>
          <p className="text-gray-500 text-sm">Analyze, summarize, and manage your academic documents & Documents.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowPasteModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Paste Notes</span>
          </button>
          {googleAccessToken && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
            >
              <FilePlus className="w-5 h-5" />
              <span>Create Document</span>
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt,.md,.rtf,.json,.csv" 
            className="hidden" 
          />
        </div>
      </header>

      {/* Connection info bar */}
      {!googleAccessToken ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">
              Connect your Workspace account to unlock real-time list, search, and creation of your Documents and files!
            </p>
          </div>
          <button 
            onClick={handleConnect}
            className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-xs font-bold transition-all"
          >
            Connect Account
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-800">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-medium">
              Successfully synchronized with Cloud Drive & Documents. Showing live Workspace assets.
            </p>
          </div>
          <button 
            onClick={handleFetchDriveFiles}
            disabled={loadingFiles}
            className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
          >
            {loadingFiles && <Loader2 className="w-3 h-3 animate-spin" />}
            Refresh Drive List
          </button>
        </div>
      )}

      {/* AI Analysis Result Panel */}
      {selectedDoc && (
        <div className="bg-white p-6 rounded-[2rem] border border-brand-primary/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
              <span>AI Insights & Study Guide: {selectedDoc.name}</span>
            </h3>
            <button 
              onClick={() => setSelectedDoc(null)}
              className="text-xs text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
          {analyzing ? (
            <AIAnalysisSkeleton />
          ) : (
            <div className="p-6 bg-gray-50/50 rounded-2xl text-xs text-gray-700 leading-relaxed border border-gray-100 prose prose-xs max-w-none">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-base font-bold text-gray-900 mt-4 mb-2 border-b pb-1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-sm font-bold text-gray-800 mt-3 mb-1.5" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xs font-bold text-gray-700 mt-2 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2.5 text-gray-600 text-xs leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 pl-1 text-gray-600" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 pl-1 text-gray-600" {...props} />,
                  li: ({node, ...props}) => <li className="text-xs leading-relaxed animate-fade-in" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                }}
              >
                {aiAnalysisResult}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Paste Study Material Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-lg w-full border border-gray-100 shadow-xl space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <span>Paste Study Material</span>
              </h3>
              <p className="text-xs text-gray-400">Paste your study notes, textbook chapters, or reference text to extract bullet points and action items instantly.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Title</label>
                <input 
                  type="text" 
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="e.g. Mitochondria & Cell Organelles Notes" 
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none text-xs focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Study Content</label>
                <textarea 
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste your study notes here..." 
                  rows={8}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none text-xs focus:border-brand-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasteModal(false);
                    setPasteTitle("");
                    setPasteContent("");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasteSubmit}
                  disabled={!pasteContent.trim()}
                  className="px-5 py-2 bg-brand-primary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Summarize Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full border border-gray-100 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create Document</h3>
              <p className="text-xs text-gray-400">Instantly generate a real Documentument in your Cloud Drive.</p>
            </div>
            <form onSubmit={handleCreateGoogleDoc} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Document Title</label>
                <input 
                  type="text" 
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Chemistry Study Guide" 
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none text-xs focus:border-brand-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creatingDoc || !newDocTitle.trim()}
                  className="px-4 py-2 bg-brand-primary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingDoc && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table Document view */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">All</button>
            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">PDFs</button>
            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Docs</button>
          </div>
        </div>

        {loadingFiles ? (
          <DocumentSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Modified</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{doc.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                            {doc.size || "Managed Cloud Document"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500 font-medium">
                      {formatMimeType(doc.mimeType)}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">
                      {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAIAnalyze(doc)}
                          className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" 
                          title="AI Analysis"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        {doc.webViewLink ? (
                          <a 
                            href={doc.webViewLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" 
                            title="Open in Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Open">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {displayedDocs.length === 0 && !loadingFiles && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-bold mb-2">No documents found</h3>
            <p className="text-gray-500 text-sm mb-6">Upload or connect Cloud Drive to start analyzing documents.</p>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-brand-secondary/5 p-8 rounded-[2rem] border border-brand-secondary/10">
          <div className="w-12 h-12 bg-brand-secondary text-white rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Quick Actions</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Select a document to instantly summarize, explain difficult paragraphs, or generate quizzes.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:border-brand-secondary transition-all">Summarize All</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:border-brand-secondary transition-all">Extract Citations</button>
          </div>
        </div>
        <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Workspace</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Connect your Cloud Drive to seamlessly import and analyze your Docs, Sheets, and Slides.
          </p>
          <button 
            onClick={handleConnect}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
          >
            {googleAccessToken ? "Synchronized" : "Connect Drive"}
          </button>
        </div>
      </section>
    </div>
  );
}
