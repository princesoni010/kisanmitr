

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DocumentAnalysisPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);
      
      // Create a preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-10 bg-primary text-white p-4">
        <h1 className="text-xl font-bold">{t.doc_title}</h1>
        <p className="text-sm opacity-90">{t.doc_subtitle}</p>
      </header>

      <main className="p-4 flex-1 overflow-y-auto pb-24">
        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
          <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-success mb-1">{t.doc_secure}</p>
            <p className="text-xs text-green-800">
              {t.doc_secure_msg}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 border border-border shadow-sm mb-6">
          <p className="text-sm text-text-subtle mb-4 font-medium leading-relaxed">
            {t.doc_upload_hint}
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf"
          />
          
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/50 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-primary">{t.doc_upload_label}</p>
              <p className="text-xs text-text-subtle mt-1 font-medium">JPEG, PNG, PDF</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 flex flex-col items-center">
              {preview ? (
                <img src={preview} alt="Document Preview" className="max-h-48 rounded-lg mb-4 object-contain shadow-sm border border-slate-200" />
              ) : (
                <div className="h-32 flex flex-col items-center justify-center bg-gray-50 w-full rounded-lg mb-4 border border-slate-200">
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-600 truncate px-4">{file.name}</p>
                </div>
              )}
              
              <div className="flex gap-2 w-full">
                <Button 
                  className="flex-1 bg-white border border-border text-text-subtle hover:bg-gray-50 font-bold" 
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                >
                  {t.doc_change_btn}
                </Button>
                <Button 
                  className="flex-1 font-bold" 
                  onClick={handleAnalyze} 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t.doc_analyze_btn}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="bg-surface rounded-xl p-6 border border-border shadow-sm flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="font-bold">{t.doc_loading}</p>
            <p className="text-sm text-text-subtle mt-1 font-medium">{t.doc_loading_sub}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-error rounded-xl p-4 text-error flex gap-2 items-start mb-6 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <p className="font-bold text-primary mb-1">{t.doc_ai_msg}</p>
              <p className="text-sm font-medium leading-relaxed">{result.message}</p>
            </div>
            
            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
              <p className="font-bold mb-1">{t.doc_extracted}</p>
              <p className="text-sm text-text-subtle font-medium leading-relaxed whitespace-pre-line">{result.extracted_info}</p>
            </div>

            <h3 className="font-bold text-lg mt-6 mb-3">{t.doc_eligible_title}</h3>
            
            {result.eligible_schemes && result.eligible_schemes.length > 0 ? (
              <div className="space-y-3">
                {result.eligible_schemes.map((scheme: any, idx: number) => (
                  <div key={idx} className="bg-white border border-success/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-success"></div>
                    <h4 className="font-bold text-success mb-1 pl-2">{scheme.scheme_name}</h4>
                    <p className="text-xs font-bold text-text-subtle mb-2 pl-2">Scheme ID: {scheme.scheme_id}</p>
                    <p className="text-sm bg-green-50 p-2.5 rounded-lg border border-green-100 font-medium leading-relaxed">{scheme.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6 text-center shadow-sm">
                <p className="text-sm text-text-subtle font-medium">{t.doc_no_match}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
