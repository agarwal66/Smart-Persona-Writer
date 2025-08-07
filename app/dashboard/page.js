// ---2nd code  adding styling 
// Here's your updated Dashboard UI layout, keeping logic the same
// Enhancements: Improved layout, card grouping, hover effects, visual hierarchy, and better dark mode contrast

// Revamped, modern, interactive dashboard with new layout and enhanced UI
// Redesigned DashboardPage — Unique Layout & Modern UI
'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Download, Copy, Sun, Moon } from "lucide-react";
import './dashboard.css';

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
      fetchHistory();
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
    await fetch(`/api/personas/${id}`, { method: "DELETE" });
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
      if (!res.ok) return setGenerated("❌ Server error occurred.");

      const data = JSON.parse(text);
      setGenerated(data.result || "❌ No result returned.");

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
    } catch {
      setGenerated("❌ Request failed.");
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

  if (!session) return <p className="text-center mt-20 text-red-500 text-xl">Login required</p>;

  return (
    <TooltipProvider>
      <div className={`dashboard-root ${darkMode ? "dark" : "light"}`}>
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>🧠 Smart Persona Writer</h1>
            <p>Craft personas & generate magical content with AI ✨</p>
          </div>
          <Button onClick={() => setDarkMode(!darkMode)} variant="ghost">
            {darkMode ? <Sun /> : <Moon />}
          </Button>
        </header>

        {/* Persona & Generator */}
        <section className="dashboard-section">
          <Card className="glass-card">
            <CardContent>
              <h2>🎭 Create Persona</h2>
              <form onSubmit={handleSubmit} className="grid gap-3">
                <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Tone" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
                <Input placeholder="Style" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} />
                <Input placeholder="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
                <Button type="submit">💾 Save</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent>
              <h2>⚡ Generate Content</h2>
              <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)}>
                <option value="">Select Persona</option>
                {personas.map((p) => (
                  <option key={p._id} value={JSON.stringify(p)}>{p.name}</option>
                ))}
              </select>
              <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)}>
                <option>Blog Post</option>
                <option>Tweet Thread</option>
                <option>Product Description</option>
                <option>LinkedIn Post</option>
              </select>
              <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <Button onClick={handleGenerate} disabled={loading}>{loading ? "⏳ Generating..." : "🚀 Generate"}</Button>
            </CardContent>
          </Card>
        </section>

        {/* Personas */}
        <section className="dashboard-personas">
          <h3>🧬 Your Personas</h3>
          <div className="persona-grid">
            {personas.length === 0 ? <p>No personas yet.</p> : personas.map((p) => (
              <Card key={p._id} className="persona-card">
                <div>
                  <p>{p.name}</p>
                  <div className="persona-tags">
                    <Badge>{p.tone}</Badge>
                    <Badge>{p.style}</Badge>
                    <Badge>{p.domain}</Badge>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => handleDeletePersona(p._id)}>
                      <Trash2 className="text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </Card>
            ))}
          </div>
        </section>

        {/* Generated Output */}
        {generated && (
          <section className="dashboard-output">
            <h3>🎉 Generated Output</h3>
            <Textarea className="output-box" value={generated} readOnly />
            <div className="action-buttons">
              <Button variant="outline" onClick={handleCopy}><Copy /> Copy</Button>
              <Button variant="outline" onClick={handleDownload}><Download /> Download</Button>
              <Button variant="outline" onClick={handleGenerate}><RefreshCw /> Regenerate</Button>
            </div>
          </section>
        )}

        {/* History */}
        <section className="dashboard-history">
          <Input placeholder="🔍 Search by topic..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="history-header">
            <h2>📜 Saved History</h2>
            {history.length > 0 && <Button variant="destructive" onClick={handleClearHistory}>🧹 Clear All</Button>}
          </div>
          {history.length === 0 ? (
            <p>📭 No content generated yet.</p>
          ) : (
            <div className="history-grid">
              {history.filter((item) => item.topic.toLowerCase().includes(search.toLowerCase())).map((item) => (
                <Card key={item._id} className="history-card">
                  <CardContent>
                    <p><strong>📝 Topic:</strong> {item.topic}</p>
                    <p className="text-xs"><strong>Template:</strong> {item.template}</p>
                    <pre>{item.content}</pre>
                    <div className="flex gap-3 mt-2">
                      <Button variant="link" onClick={() => navigator.clipboard.writeText(item.content)}>Copy</Button>
                      <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(item.content)}`} download={`${item.topic}.txt`}>
                        <Button variant="link">Download</Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </TooltipProvider>
  );
}









// ---1st code before adding anystyling 
// 'use client';

// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";

// export default function DashboardPage() {
//   const { data: session } = useSession();

//   const [form, setForm] = useState({ name: "", tone: "", style: "", domain: "" });
//   const [personas, setPersonas] = useState([]);
//   const [selectedPersona, setSelectedPersona] = useState("");
//   const [selectedPrompt, setSelectedPrompt] = useState("Blog Post");
//   const [topic, setTopic] = useState("");
//   const [generated, setGenerated] = useState("");
//   const [history, setHistory] = useState([]);
//   const [search, setSearch] = useState("");
//   const [darkMode, setDarkMode] = useState(false);
//   const [loading, setLoading] = useState(false);
// useEffect(() => {
//   if (session?.user) {
//     fetchPersonas();
//     fetchHistory(); // ✅ Load history on first load after login
//   }
// }, [session?.user]);

//   const fetchPersonas = async () => {
//     const res = await fetch("/api/personas");
//     const data = await res.json();
//     setPersonas(data);
//   };

//   const fetchHistory = async () => {
//     const res = await fetch("/api/history");
//     const data = await res.json();
//     setHistory(data);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await fetch("/api/personas", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     setForm({ name: "", tone: "", style: "", domain: "" });
//     fetchPersonas();
//   };

//   const handleDeletePersona = async (id) => {
//     await fetch(`/api/personas/${id}, { method: "DELETE" }`);
//     fetchPersonas();
//   };

//   const handleGenerate = async () => {
//     if (!topic || !selectedPersona) return alert("Select persona and enter topic");
//     setLoading(true);
//     setGenerated("");
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           persona: JSON.parse(selectedPersona),
//           template: selectedPrompt,
//           topic,
//         }),
//       });

//       const text = await res.text();
//       if (!res.ok) {
//         setGenerated("\u274C Server error occurred.");
//         return;
//       }

//       const data = JSON.parse(text);
//       setGenerated(data.result || "\u274C No result returned.");

//       await fetch("/api/saveGenerated", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           persona: JSON.parse(selectedPersona),
//           template: selectedPrompt,
//           topic,
//           content: data.result,
//         }),
//       });

//       fetchHistory();
//     } catch (err) {
//       setGenerated("\u274C Request failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(generated);
//     alert("Copied to clipboard!");
//   };

//   const handleDownload = () => {
//     const blob = new Blob([generated], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${topic || "content"}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleClearHistory = async () => {
//     if (!confirm("Clear entire history?")) return;
//     await fetch("/api/history", { method: "DELETE" });
//     setHistory([]);
//   };

// // const handlePDFUpload = async (e) => {
// //   e.preventDefault();
// //   const formData = new FormData();
// //   const file = document.getElementById("pdfUpload").files[0];
// //   if (!file) return alert("Please upload a PDF file.");

// //   formData.append("pdf", file);
// //   try {
// //     setLoading(true);
// //     const res = await fetch("/api/uploadPdf", {
// //       method: "POST",
// //       body: formData,
// //     });

// //     const data = await res.json();
// //     if (!res.ok) return alert("PDF parsing failed");

// //     // ✅ use 'data.text' as returned by your API
// //     setGenerated(data.text || "No content parsed.");
// //   } catch (err) {
// //     alert("Upload failed.");
// //     console.error(err);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

//   if (!session) return <p className="text-center mt-20 text-red-500 text-xl">Login required</p>;

//   return (
//     <div className={darkMode ? "bg-black text-white min-h-screen p-4" : "bg-white text-black min-h-screen p-4"}>
//       <div className="flex justify-between mb-6">
//         <h1 className="text-3xl font-bold">Dashboard</h1>
//         <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-800 text-white px-4 py-1 rounded">
//           {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
//         </button>
//       </div>

//       {/* Persona Form */}
//       <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
//         <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Persona Name" className="w-full border p-2 rounded" />
//         <input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="Tone" className="w-full border p-2 rounded" />
//         <input value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="Style" className="w-full border p-2 rounded" />
//         <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Domain" className="w-full border p-2 rounded" />
//         <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded w-full">Save Persona</button>
//       </form>

//       {/* Personas */}
//       <h2 className="text-xl font-semibold mt-10 mb-4">Your Personas</h2>
//       <ul className="space-y-2">
//         {personas.map((p) => (
//           <li key={p._id} className="flex justify-between items-center border rounded p-3 bg-white text-black">
//             <span><strong>{p.name}</strong> — {p.tone}, {p.style}, {p.domain}</span>
//             <button onClick={() => handleDeletePersona(p._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
//           </li>
//         ))}
//       </ul>

//       {/* Content Generator */}
//       <h2 className="text-xl font-semibold mt-10 mb-4">Generate Content</h2>
//       <div className="space-y-4 max-w-md mx-auto">
//         <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="w-full border p-2 rounded">
//           <option value="">Select Persona</option>
//           {personas.map((p) => (
//             <option key={p._id} value={JSON.stringify(p)}>{p.name}</option>
//           ))}
//         </select>

//         <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)} className="w-full border p-2 rounded">
//           <option>Blog Post</option>
//           <option>Tweet Thread</option>
//           <option>Product Description</option>
//           <option>LinkedIn Post</option>
//         </select>

//         <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter Topic" className="w-full border p-2 rounded" />
//         <button onClick={handleGenerate} className="bg-purple-600 text-white px-4 py-2 rounded w-full">{loading ? "Generating..." : "Generate"}</button>
//       </div>

//       {/* PDF Upload Section */}
//       {/* <h2 className="text-xl font-semibold mt-10 mb-4">Generate from PDF</h2>
//       <div className="space-y-4 max-w-md mx-auto">
//         <form onSubmit={handlePDFUpload}>
//           <input type="file" accept="application/pdf" id="pdfUpload" className="w-full border p-2 rounded bg-white text-black" />
//           <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">{loading ? "Parsing PDF..." : "Generate from PDF"}</button>
//         </form>
//       </div> */}

//       {/* Generated Content */}
//       {generated && (
//         <div className="mt-6 p-4 border rounded shadow bg-gray-100 text-black">
//           <h3 className="text-lg font-semibold mb-2">Generated:</h3>
//           <p className="whitespace-pre-wrap">{generated}</p>
//           <div className="flex gap-4 mt-3">
//             <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-1 rounded">Copy</button>
//             <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-1 rounded">Download</button>
//             <button onClick={handleGenerate} className="bg-yellow-600 text-white px-4 py-1 rounded">Regenerate</button>
//           </div>
//         </div>
//       )}

//       {/* Search */}
//       <input type="text" placeholder="Search topic..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 mt-10 mb-4 border rounded" />

//       {/* History */}
//       <div className="mt-6">
//         <div className="flex justify-between items-center">
//           <h2 className="text-xl font-semibold">Saved History</h2>
//           <button onClick={handleClearHistory} className="text-sm bg-red-600 text-white px-2 py-1 rounded">Clear All</button>
//         </div>
//         <ul className="mt-4 space-y-3">
//           {history.filter((item) => item.topic.toLowerCase().includes(search.toLowerCase())).map((item) => (
//             <li key={item._id} className="border p-3 rounded bg-white text-black">
//               <p><strong>Topic:</strong> {item.topic}</p>
//               <p className="text-sm text-gray-600"><strong>Template:</strong> {item.template}</p>
//               <pre className="mt-1 text-gray-800 text-sm whitespace-pre-wrap">{item.content}</pre>
//               <div className="flex gap-4 mt-2">
//                 <button onClick={() => {
//                   navigator.clipboard.writeText(item.content);
//                   alert("Copied to clipboard");
//                 }} className="text-sm text-blue-500 hover:underline">Copy</button>
//                 <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(item.content)}`} download={`${item.topic}.txt`} className="text-sm text-green-500 hover:underline">Download</a>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }