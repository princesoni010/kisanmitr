
import { Bell, Mic, Send, Search, ShieldCheck, FileText, HelpCircle, Loader2, Volume2, SquareSquare, ScanText, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [schemes, setSchemes] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Namaste! Main Kisanमित्र hoon. Aaj main aapki kaise madad kar sakta hoon?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => setSchemes(data.schemes))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Strip markdown symbols so TTS doesn't say "asterisk asterisk" etc.
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")   // **bold** → bold
      .replace(/\*(.*?)\*/g, "$1")        // *italic* → italic
      .replace(/^\s*\*\s+/gm, "")         // * bullet points → remove asterisk
      .replace(/^\s*-\s+/gm, "")          // - bullet points → remove dash
      .replace(/^\s*#{1,6}\s+/gm, "")     // # headings → remove hash
      .replace(/`{1,3}(.*?)`{1,3}/gs, "$1") // `code` → code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // [link](url) → link text only
      .replace(/_{1,2}(.*?)_{1,2}/g, "$1") // _italic_ / __bold__ → text
      .replace(/\n{2,}/g, "। ")            // double newlines → sentence pause
      .replace(/\n/g, ", ")               // single newlines → pause
      .trim();
  };

  const speakText = (text: string, idx: number) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // If user clicked the same message currently speaking, just stop it
    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      return;
    }

    setSpeakingIdx(idx);
    const cleanText = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hi-IN"; // Set to Hindi/Indian accent
    
    utterance.onend = () => {
      setSpeakingIdx(null);
    };
    
    utterance.onerror = () => {
      setSpeakingIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Build history (exclude greeting, map bot→assistant)
    const history = updatedMessages.slice(1, -1).map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }));

    // Add an empty bot bubble immediately — will fill via streaming
    setMessages((prev) => [...prev, { role: "bot" as const, content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { setIsLoading(false); break; }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.delta) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "bot",
                  content: updated[updated.length - 1].content + parsed.delta,
                };
                return updated;
              });
            }
            if (parsed.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "bot", content: parsed.error };
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", content: "Kuch gadbad ho gayi, kripya dobara try karein." };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };


  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Microphone access or speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };


  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-white h-14 flex items-center justify-between px-4 flex-shrink-0 relative">
        <h1 className="text-lg font-semibold">{t.app_title}</h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Bell 
              className="w-5 h-5 cursor-pointer" 
              onClick={() => setShowNotifications(!showNotifications)} 
            />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-primary"></span>
            </span>
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-14 right-4 w-72 bg-white text-foreground rounded-xl shadow-lg border border-border overflow-hidden z-40 animate-in slide-in-from-top-2">
            <div className="p-3 bg-gray-50 border-b border-border font-semibold flex justify-between items-center">
              <span>{t.notifications}</span>
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">New</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <Link to="/document-analysis" onClick={() => setShowNotifications(false)} className="block p-4 border-b border-border hover:bg-blue-50 transition-colors">
                <p className="font-bold text-sm text-primary mb-1">New AI Feature! 🌾</p>
                <p className="text-xs text-text-subtle">
                  Upload your Aadhaar or Land Record to find matching schemes instantly. 100% secure.
                </p>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="p-4 flex-1 overflow-y-auto pb-24">
        {/* Quick Actions (Horizontal Scroll) */}
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar mb-4">
          <Link to="/schemes" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface border border-primary text-primary rounded-full hover:bg-blue-50 transition-colors">
            <Search className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap text-sm">{t.quick_find}</span>
          </Link>
          <Link to="/document-analysis" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface border border-primary text-primary rounded-full hover:bg-blue-50 transition-colors">
            <ScanText className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap text-sm">{t.quick_match}</span>
          </Link>
          <Link to="/fraud-check" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface border border-primary text-primary rounded-full hover:bg-blue-50 transition-colors">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap text-sm">{t.quick_fraud}</span>
          </Link>
          <Link to="/profile" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface border border-primary text-primary rounded-full hover:bg-blue-50 transition-colors">
            <FileText className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap text-sm">{t.quick_apps}</span>
          </Link>
        </div>

        {/* Featured Schemes */}
        <h3 className="font-bold text-lg mb-3">{t.popular_schemes}</h3>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar mb-6">
          {schemes.map((scheme) => (
            <div key={scheme.scheme_id} className="flex-shrink-0 w-64 bg-surface rounded-xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏛️</span>
                <h4 className="font-bold text-sm line-clamp-2">{scheme.name}</h4>
              </div>
              <p className="text-xs text-text-subtle mb-3 line-clamp-2">{scheme.benefits}</p>
              <Link to={`/schemes/${scheme.scheme_id}`} className="text-primary text-sm font-medium hover:underline">
                {t.view_details}
              </Link>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <h3 className="font-bold text-lg mb-3">{t.ask_ai}</h3>
        <div className="flex flex-col gap-3 mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100 min-h-[300px]">
          {messages.map((msg, idx) => {
            // If it's the bot's empty placeholder while loading, show bouncing dots
            const isTyping = msg.role === "bot" && msg.content === "" && isLoading;

            return (
              <div key={idx} className={`flex gap-2 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-green-100 text-lg flex items-center justify-center flex-shrink-0 mt-1">🌾</div>
                )}
                <div className={`relative p-3 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-white border border-border text-foreground rounded-tl-sm shadow-sm"
                }`}>
                  {msg.role === "bot" ? (
                    isTyping ? (
                      <div className="flex space-x-1.5 items-center h-5 px-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none
                        prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-2 prose-headings:mb-1
                        prose-p:my-1 prose-p:leading-relaxed
                        prose-strong:font-bold prose-strong:text-foreground
                        prose-ul:my-1 prose-ul:pl-4 prose-ul:list-disc
                        prose-ol:my-1 prose-ol:pl-4 prose-ol:list-decimal
                        prose-li:my-0.5 prose-li:leading-relaxed
                        prose-a:text-primary prose-a:underline
                      ">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    msg.content
                  )}
                  {msg.role === "bot" && !isTyping && (
                    <button 
                      onClick={() => speakText(msg.content, idx)}
                      className="mt-2 text-text-subtle hover:text-primary flex items-center gap-1.5 transition-colors"
                    >
                      {speakingIdx === idx ? (
                        <SquareSquare className="w-4 h-4 text-red-500" /> 
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">{speakingIdx === idx ? t.stop_btn : t.speak_btn}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* AI Input Box - Fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-background border-t border-border z-20">
        <div className="max-w-md mx-auto relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t.chat_placeholder}
            className="w-full bg-surface border border-border rounded-full py-3 pl-4 pr-24 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <div className="absolute right-2 flex gap-1 items-center">
            <button 
              onClick={startListening}
              className={`p-2 transition-colors rounded-full ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-text-subtle hover:text-primary bg-gray-50"}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="p-2 bg-primary text-white hover:bg-secondary transition-colors rounded-full disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
