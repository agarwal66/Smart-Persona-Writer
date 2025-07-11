// ---2nd code  adding styling 
'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, Download, Copy, Sun, Moon, Plus } from "lucide-react";

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
    } catch (err) {
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
      <div className={`min-h-screen px-6 py-10 transition ${darkMode ? "bg-gradient-to-br from-black via-gray-900 to-black text-white" : "bg-gradient-to-br from-white via-gray-100 to-white text-black"}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">🧠 Smart Persona Writer</h1>
            <p className="text-muted-foreground text-sm">Craft personas & generate magical content with AI ✨</p>
          </div>
          <Button onClick={() => setDarkMode(!darkMode)} variant="ghost" className="hover:scale-110 transition">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Persona Form */}
        <Card className="max-w-xl mx-auto mb-12 shadow-lg bg-white/10 backdrop-blur border border-purple-300">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">🎭 Create Persona</h2>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <Input placeholder="👤 Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="🎵 Tone" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
              <Input placeholder="🎨 Style" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} />
              <Input placeholder="🌐 Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
              <Button type="submit" className="w-full" icon={<Plus className="w-4 h-4" />}>💾 Save</Button>
            </form>
          </CardContent>
        </Card>

        {/* Personas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {personas.length === 0 ? (
            <p className="text-center col-span-full opacity-60">😕 No personas yet. Create one above.</p>
          ) : personas.map((p) => (
            <Card key={p._id} className="p-4 flex justify-between items-start shadow-md hover:shadow-xl transition">
              <div>
                <p className="font-semibold text-lg">{p.name}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  <Badge variant="outline">{p.tone}</Badge>
                  <Badge variant="outline">{p.style}</Badge>
                  <Badge variant="outline">{p.domain}</Badge>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePersona(p._id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </Card>
          ))}
        </div>

        {/* Content Generator */}
        <Card className="max-w-xl mx-auto mb-12 bg-white/10 backdrop-blur border border-gray-300 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">⚡ Generate Content</h2>
            <select className="w-full border p-2 rounded" value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)}>
              <option value="">Select Persona</option>
              {personas.map((p) => (
                <option key={p._id} value={JSON.stringify(p)}>{p.name}</option>
              ))}
            </select>
            <select className="w-full border p-2 rounded" value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)}>
              <option>Blog Post</option>
              <option>Tweet Thread</option>
              <option>Product Description</option>
              <option>LinkedIn Post</option>
            </select>
            <Input placeholder="🎯 Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? "⏳ Generating..." : "🚀 Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Output */}
        {generated && (
          <div className="mt-10 bg-white/10 backdrop-blur border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">🎉 Generated Output</h3>
            <Textarea className="text-sm whitespace-pre-wrap min-h-[150px]" value={generated} readOnly />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={handleCopy}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
              <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-1" /> Download</Button>
              <Button variant="outline" onClick={handleGenerate}><RefreshCw className="w-4 h-4 mr-1" /> Regenerate</Button>
            </div>
          </div>
        )}

        {/* History */}
        <Input className="mt-14" placeholder="🔍 Search by topic..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📜 Saved History</h2>
            {history.length > 0 && (
              <Button size="sm" variant="destructive" onClick={handleClearHistory}>🧹 Clear All</Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-center text-gray-500 mt-6">📭 No content generated yet.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {history.filter((item) => item.topic.toLowerCase().includes(search.toLowerCase())).map((item) => (
                <Card key={item._id} className="p-4 shadow-md hover:shadow-lg transition">
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">📝 <strong>Topic:</strong> {item.topic}</p>
                    <p className="text-xs text-muted-foreground"><strong>Template:</strong> {item.template}</p>
                    <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{item.content}</pre>
                    <div className="flex gap-3">
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
        </div>
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