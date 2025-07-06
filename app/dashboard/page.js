'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [form, setForm] = useState({ name: "", tone: "", style: "", domain: "" });
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("Blog Post");
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState("");
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
useEffect(() => {
  if (session?.user) {
    fetchPersonas();
    fetchHistory(); // ✅ Load history on first load after login
  }
}, [session?.user]);

  const fetchPersonas = async () => {
    const res = await fetch("/api/personas");
    const data = await res.json();
    setPersonas(data);
  };

  const fetchHistory = async () => {
    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", tone: "", style: "", domain: "" });
    fetchPersonas();
  };

  const handleDeletePersona = async (id) => {
    await fetch(`/api/personas/${id}, { method: "DELETE" }`);
    fetchPersonas();
  };

  const handleGenerate = async () => {
    if (!topic || !selectedPersona) return alert("Select persona and enter topic");
    setLoading(true);
    setGenerated("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: JSON.parse(selectedPersona),
          template: selectedPrompt,
          topic,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        setGenerated("\u274C Server error occurred.");
        return;
      }

      const data = JSON.parse(text);
      setGenerated(data.result || "\u274C No result returned.");

      await fetch("/api/saveGenerated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: JSON.parse(selectedPersona),
          template: selectedPrompt,
          topic,
          content: data.result,
        }),
      });

      fetchHistory();
    } catch (err) {
      setGenerated("\u274C Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    alert("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([generated], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "content"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    if (!confirm("Clear entire history?")) return;
    await fetch("/api/history", { method: "DELETE" });
    setHistory([]);
  };

// const handlePDFUpload = async (e) => {
//   e.preventDefault();
//   const formData = new FormData();
//   const file = document.getElementById("pdfUpload").files[0];
//   if (!file) return alert("Please upload a PDF file.");

//   formData.append("pdf", file);
//   try {
//     setLoading(true);
//     const res = await fetch("/api/uploadPdf", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     if (!res.ok) return alert("PDF parsing failed");

//     // ✅ use 'data.text' as returned by your API
//     setGenerated(data.text || "No content parsed.");
//   } catch (err) {
//     alert("Upload failed.");
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
// };

  if (!session) return <p className="text-center mt-20 text-red-500 text-xl">Login required</p>;

  return (
    <div className={darkMode ? "bg-black text-white min-h-screen p-4" : "bg-white text-black min-h-screen p-4"}>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-800 text-white px-4 py-1 rounded">
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Persona Form */}
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Persona Name" className="w-full border p-2 rounded" />
        <input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="Tone" className="w-full border p-2 rounded" />
        <input value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="Style" className="w-full border p-2 rounded" />
        <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Domain" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full">Save Persona</button>
      </form>

      {/* Personas */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Your Personas</h2>
      <ul className="space-y-2">
        {personas.map((p) => (
          <li key={p._id} className="flex justify-between items-center border rounded p-3 bg-white text-black">
            <span><strong>{p.name}</strong> — {p.tone}, {p.style}, {p.domain}</span>
            <button onClick={() => handleDeletePersona(p._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </li>
        ))}
      </ul>

      {/* Content Generator */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Generate Content</h2>
      <div className="space-y-4 max-w-md mx-auto">
        <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="w-full border p-2 rounded">
          <option value="">Select Persona</option>
          {personas.map((p) => (
            <option key={p._id} value={JSON.stringify(p)}>{p.name}</option>
          ))}
        </select>

        <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)} className="w-full border p-2 rounded">
          <option>Blog Post</option>
          <option>Tweet Thread</option>
          <option>Product Description</option>
          <option>LinkedIn Post</option>
        </select>

        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter Topic" className="w-full border p-2 rounded" />
        <button onClick={handleGenerate} className="bg-purple-600 text-white px-4 py-2 rounded w-full">{loading ? "Generating..." : "Generate"}</button>
      </div>

      {/* PDF Upload Section */}
      {/* <h2 className="text-xl font-semibold mt-10 mb-4">Generate from PDF</h2>
      <div className="space-y-4 max-w-md mx-auto">
        <form onSubmit={handlePDFUpload}>
          <input type="file" accept="application/pdf" id="pdfUpload" className="w-full border p-2 rounded bg-white text-black" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">{loading ? "Parsing PDF..." : "Generate from PDF"}</button>
        </form>
      </div> */}

      {/* Generated Content */}
      {generated && (
        <div className="mt-6 p-4 border rounded shadow bg-gray-100 text-black">
          <h3 className="text-lg font-semibold mb-2">Generated:</h3>
          <p className="whitespace-pre-wrap">{generated}</p>
          <div className="flex gap-4 mt-3">
            <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-1 rounded">Copy</button>
            <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-1 rounded">Download</button>
            <button onClick={handleGenerate} className="bg-yellow-600 text-white px-4 py-1 rounded">Regenerate</button>
          </div>
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="Search topic..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 mt-10 mb-4 border rounded" />

      {/* History */}
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Saved History</h2>
          <button onClick={handleClearHistory} className="text-sm bg-red-600 text-white px-2 py-1 rounded">Clear All</button>
        </div>
        <ul className="mt-4 space-y-3">
          {history.filter((item) => item.topic.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <li key={item._id} className="border p-3 rounded bg-white text-black">
              <p><strong>Topic:</strong> {item.topic}</p>
              <p className="text-sm text-gray-600"><strong>Template:</strong> {item.template}</p>
              <pre className="mt-1 text-gray-800 text-sm whitespace-pre-wrap">{item.content}</pre>
              <div className="flex gap-4 mt-2">
                <button onClick={() => {
                  navigator.clipboard.writeText(item.content);
                  alert("Copied to clipboard");
                }} className="text-sm text-blue-500 hover:underline">Copy</button>
                <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(item.content)}`} download={`${item.topic}.txt`} className="text-sm text-green-500 hover:underline">Download</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}