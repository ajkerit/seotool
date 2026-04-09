import { useState, useRef, useEffect } from "react";
import { 
  PenTool, 
  Search, 
  Target, 
  Layers, 
  Users, 
  Type, 
  FileText, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Download,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateBlog, suggestTopics, type BlogInput } from "./services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState<BlogInput>({
    topic: "",
    keyword: "",
    lsi_keywords: "",
    audience: "General",
    tone: "Professional & Helpful",
    outline: "",
    youtube_url: "",
    additional_info: "",
    optimizeReadability: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setInput(prev => ({ ...prev, [name]: val }));
  };

  const handleGenerate = async () => {
    if (!input.topic || !input.keyword) {
      setError("Please provide at least a topic and a focus keyword.");
      return;
    }

    setIsGenerating(true);
    setResult("");
    setError(null);

    try {
      await generateBlog(input, (text) => {
        setResult(text);
      });
    } catch (err) {
      setError("Failed to generate blog. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestTopics = async () => {
    setIsSuggesting(true);
    try {
      const topics = await suggestTopics(input.topic);
      setSuggestions(topics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectSuggestion = (topic: string) => {
    setInput(prev => ({ ...prev, topic }));
    setSuggestions([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${input.topic.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll to bottom of result while generating
  useEffect(() => {
    if (isGenerating && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result, isGenerating]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Input Controls */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col h-screen z-20"
          >
            <div className="p-6 border-bottom border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">Bangla SEO AI</h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Target className="w-3.5 h-3.5" /> Topic (বিষয়)
                    </span>
                    <button
                      type="button"
                      onClick={handleSuggestTopics}
                      disabled={isSuggesting}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors uppercase tracking-tighter"
                    >
                      {isSuggesting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                      Suggest Ideas
                    </button>
                  </div>
                  <input
                    type="text"
                    name="topic"
                    value={input.topic}
                    onChange={handleInputChange}
                    placeholder="উদা: ফ্রিল্যান্সিং শুরু করার গাইড"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                  
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                          <div className="flex items-center justify-between px-2 mb-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Recommended Topics</span>
                            <button onClick={() => setSuggestions([])} className="text-emerald-400 hover:text-emerald-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {suggestions.map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => selectSuggestion(topic)}
                              className="w-full text-left p-2 text-xs text-slate-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <Search className="w-3.5 h-3.5" /> Focus Keyword
                  </span>
                  <input
                    type="text"
                    name="keyword"
                    value={input.keyword}
                    onChange={handleInputChange}
                    placeholder="উদা: ফ্রিল্যান্সিং গাইড ২০২৪"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <Layers className="w-3.5 h-3.5" /> LSI Keywords
                  </span>
                  <textarea
                    name="lsi_keywords"
                    value={input.lsi_keywords}
                    onChange={handleInputChange}
                    placeholder="উদা: অনলাইন ইনকাম, স্কিল ডেভেলপমেন্ট..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      <Users className="w-3.5 h-3.5" /> Audience
                    </span>
                    <select
                      name="audience"
                      value={input.audience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option>General</option>
                      <option>Beginners</option>
                      <option>Professionals</option>
                      <option>Students</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      <Type className="w-3.5 h-3.5" /> Tone
                    </span>
                    <select
                      name="tone"
                      value={input.tone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option>Professional</option>
                      <option>Conversational</option>
                      <option>Inspirational</option>
                      <option>Educational</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <Youtube className="w-3.5 h-3.5" /> YouTube Video Link (ঐচ্ছিক)
                  </span>
                  <input
                    type="url"
                    name="youtube_url"
                    value={input.youtube_url}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <FileText className="w-3.5 h-3.5" /> Additional Info (আপনার দেওয়া তথ্য)
                  </span>
                  <textarea
                    name="additional_info"
                    value={input.additional_info}
                    onChange={handleInputChange}
                    placeholder="পোস্টের জন্য আপনার কাছে কোনো নির্দিষ্ট তথ্য বা ডেটা থাকলে এখানে দিন..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                  />
                </label>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-700">Optimize Readability</span>
                    <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">সহজবোধ্যতা অপ্টিমাইজেশন</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, optimizeReadability: !prev.optimizeReadability }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                      input.optimizeReadability ? "bg-emerald-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        input.optimizeReadability ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <label className="block">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <FileText className="w-3.5 h-3.5" /> Outline (Optional)
                  </span>
                  <textarea
                    name="outline"
                    value={input.outline}
                    onChange={handleInputChange}
                    placeholder="AI will generate if empty..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                  />
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn(
                  "w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20",
                  isGenerating 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Blog
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900">Blog Generator</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <>
                <button
                  onClick={handleCopy}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 text-sm font-medium text-slate-600"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 text-sm font-medium text-slate-600"
                  title="Download as Markdown"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Result Viewer */}
        <div 
          ref={resultRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-white"
        >
          <div className="max-w-4xl mx-auto">
            {!result && !isGenerating ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <PenTool className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Ready to write?</h2>
                  <p className="text-slate-500 max-w-md">
                    Fill in the details on the left and click generate to create a high-quality, 
                    SEO-optimized Bangla blog post.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-3xl">
                  {[
                    { icon: Search, label: "SEO Optimized" },
                    { icon: Sparkles, label: "AI Powered" },
                    { icon: Target, label: "Rank Ready" },
                    { icon: Check, label: "Fact Checked" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="markdown-body prose prose-slate prose-emerald max-w-none"
              >
                <Markdown>{result}</Markdown>
                {isGenerating && (
                  <div className="flex items-center gap-2 text-emerald-600 mt-8 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is writing your blog post...</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        
        /* Markdown Styling */
        .markdown-body h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; color: #0F172A; line-height: 1.2; }
        .markdown-body h2 { font-size: 1.875rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; color: #1E293B; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.5rem; }
        .markdown-body h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #334155; }
        .markdown-body p { margin-bottom: 1.25rem; line-height: 1.8; color: #475569; font-size: 1.125rem; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-body li { margin-bottom: 0.5rem; color: #475569; font-size: 1.125rem; }
        .markdown-body blockquote { border-left: 4px solid #10B981; padding-left: 1.5rem; font-style: italic; color: #64748B; margin: 2rem 0; }
        .markdown-body table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .markdown-body th, .markdown-body td { border: 1px solid #E2E8F0; padding: 0.75rem 1rem; text-align: left; }
        .markdown-body th { background: #F8FAFC; font-weight: 600; }
        .markdown-body code { background: #F1F5F9; padding: 0.2rem 0.4rem; rounded: 0.25rem; font-family: monospace; font-size: 0.875em; }
        .markdown-body strong { color: #0F172A; font-weight: 600; }
      `}</style>
    </div>
  );
}
