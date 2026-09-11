import { useState, useRef } from "react";
import { Upload, AlertTriangle, ShieldCheck, AlertCircle, X, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface FraudResponse {
  risk_level: "high" | "medium" | "low";
  explanation: string;
  warning_flags?: string[];
}

export default function FraudCheckPage() {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resultData, setResultData] = useState<FraudResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSampleClick = (sampleText: string) => {
    setInputText(sampleText);
    setResultData(null);
    setStatus("idle");
  };

  const handleCheck = async () => {
    if (!inputText.trim() && !selectedFile) {
      setErrorMessage("Please paste message or upload screenshot.");
      return;
    }

    setErrorMessage(null);
    setStatus("loading");
    setResultData(null);

    try {
      const formData = new FormData();
      if (inputText.trim()) {
        formData.append("message", inputText);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch("/api/check-fraud", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data: FraudResponse = await res.json();
      setResultData(data);
      setStatus("success");
    } catch (err: any) {
      console.error("Fraud check failed:", err);
      setErrorMessage("AI Server error. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setInputText("");
    removeFile();
    setStatus("idle");
    setResultData(null);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="sticky top-0 z-10 bg-primary text-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <div>
            <h1 className="text-xl font-bold">{t.fraud_title}</h1>
            <p className="text-xs opacity-90">{t.fraud_subtitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-6 pb-24">
        {/* Intro Alert */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              {t.fraud_banner}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {t.fraud_paste_label}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mera loan ₹50,000 pass ho gaya hai, link par click karein..."
            className="w-full h-28 bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white mb-4 shadow-inner"
            disabled={status === "loading"}
          />

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative border border-emerald-300 bg-emerald-50/50 rounded-xl p-2 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="truncate text-xs">
                    <p className="font-semibold text-slate-800 truncate">{selectedFile?.name}</p>
                    <p className="text-slate-500">{((selectedFile?.size || 0) / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 hover:border-primary transition-all font-medium text-sm"
              >
                <Upload className="w-4 h-4 text-primary" />
                {t.fraud_upload_btn}
              </button>
            )}
          </div>

          {/* Sample Test Prompts */}
          <div className="mb-4 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-2">{t.fraud_quick_test}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSampleClick("PM KISAN yojana ke under ₹6,000 panjikaran ke liye ₹250 shulk bharein bit.ly/pm-kisan-fee par.")}
                className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                🚨 Fake Fee Demand (Scam)
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick("Aadhaar kyc fail ho gaya h. OTP 9482 turant share karein bank balance rokne se bachne k liye.")}
                className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium"
              >
                ⚠️ Urgent OTP Demand (Scam)
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick("Gram Panchayat bhawan me Krishi Vibhag dwara mada kisan mela Monday ko aayojit hoga. Sabhi kisan aavantit hain.")}
                className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                ✅ Safe Govt Notice
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              fullWidth
              onClick={handleCheck}
              disabled={status === "loading" || (!inputText.trim() && !selectedFile)}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t.fraud_analyzing}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t.fraud_check_btn}
                </span>
              )}
            </Button>
            
            {(inputText || selectedFile || resultData) && status !== "loading" && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                {t.fraud_reset_btn}
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner State */}
        {status === "loading" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3 text-primary animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{t.fraud_analyzing}</h3>
          </div>
        )}

        {/* Results Card */}
        {status === "success" && resultData && (
          <div className="space-y-4">
            {/* HIGH RISK RESULT */}
            {resultData.risk_level === "high" && (
              <div className="border border-red-300 bg-red-50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-red-600 text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <AlertTriangle className="w-6 h-6 text-yellow-300" />
                    High Risk Scam
                  </div>
                  <span className="bg-red-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Scam Detected</span>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-red-900 text-sm mb-2">AI Analysis:</h4>
                  <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-red-200 shadow-sm leading-relaxed mb-4 whitespace-pre-line">
                    {resultData.explanation}
                  </p>

                  {resultData.warning_flags && resultData.warning_flags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-red-900 uppercase tracking-wide mb-2">Warning Flags:</p>
                      <ul className="space-y-1.5">
                        {resultData.warning_flags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-red-800 font-medium">
                            <X className="w-3.5 h-3.5 mt-0.5 text-red-500 shrink-0" /> {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MEDIUM RISK RESULT */}
            {resultData.risk_level === "medium" && (
              <div className="border border-amber-300 bg-amber-50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-amber-500 text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <AlertCircle className="w-6 h-6 text-amber-100" />
                    Medium Risk (Suspicious)
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-amber-200 shadow-sm leading-relaxed whitespace-pre-line">
                    {resultData.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* LOW RISK RESULT */}
            {resultData.risk_level === "low" && (
              <div className="border border-green-300 bg-green-50 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-green-600 text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <ShieldCheck className="w-6 h-6 text-green-200" />
                    Safe (Likely Authentic)
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-green-200 shadow-sm leading-relaxed whitespace-pre-line">
                    {resultData.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

