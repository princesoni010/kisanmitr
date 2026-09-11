

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, ExternalLink, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SchemeDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scheme, setScheme] = useState<any>(null);
  const [docs, setDocs] = useState<Record<string, boolean>>({});

  const farmerState = localStorage.getItem("user_state") || "Chhattisgarh";
  const farmerLand = localStorage.getItem("user_land_size") || "3 Acres";

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => {
        const found = data.schemes.find((s: any) => s.scheme_id === params.id) || data.schemes[0];
        setScheme(found);
        
        // Init documents checklist state
        const initialDocs: Record<string, boolean> = {};
        found?.documents_required?.forEach((doc: string) => {
          initialDocs[doc] = false;
        });
        setDocs(initialDocs);
      })
      .catch((err) => console.error(err));
  }, [params.id]);

  if (!scheme) return <div className="p-8 text-center">{t.loading_schemes}</div>;

  const totalDocs = scheme.documents_required?.length || 0;
  const readyDocs = Object.values(docs).filter(Boolean).length;
  const readinessScore = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 100;

  const isRolling = scheme.deadline === "rolling" || scheme.deadline === "Rolling" || scheme.deadline?.toLowerCase() === "ongoing";

  return (
    <div className="flex flex-col h-full bg-background pb-8">
      <header className="sticky top-0 z-10 bg-primary text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-secondary rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold line-clamp-1">{scheme.name}</h1>
          <p className="text-sm opacity-90 capitalize">{scheme.type.replace("_", " ")}</p>
        </div>
      </header>

      <main className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Eligibility Section */}
        <section className="bg-surface rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 bg-green-100 text-success px-3 py-1.5 rounded-full text-sm font-semibold w-fit mb-3">
            <CheckCircle2 className="w-4 h-4" />
            {t.eligibility_badge}
          </div>
          <ul className="text-sm text-text-subtle list-disc pl-5 space-y-1">
            <li>{t.elig_land.replace('{land}', farmerLand)}</li>
            <li>{t.elig_state.replace('{state}', farmerState)}</li>
          </ul>
        </section>

        {/* Benefits Section */}
        <section className="bg-surface rounded-xl p-4 border border-border shadow-sm">
          <h3 className="font-bold mb-2">{t.benefits_section}</h3>
          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-primary">{scheme.benefits}</span>
          </div>
        </section>

        {/* Deadline */}
        <section className="bg-surface rounded-xl p-4 border border-border shadow-sm">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" /> {t.deadline_label}
          </h3>
          <p className={`font-semibold text-sm ${
            isRolling ? "text-emerald-700" : "text-orange-700"
          }`}>
            {isRolling ? t.deadline_rolling : scheme.deadline || "TBA"}
          </p>
        </section>

        {/* Documents & Readiness Score */}
        <section className="bg-surface rounded-xl p-4 border border-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{t.docs_section}</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              readinessScore === 100 ? "bg-green-100 text-success" :
              readinessScore > 50 ? "bg-yellow-100 text-warning" : "bg-red-100 text-error"
            }`}>
              {readinessScore}% {t.ready_pct}
            </div>
          </div>
          
          <div className="space-y-3">
            {scheme.documents_required?.map((doc: string, idx: number) => (
              <label key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={docs[doc]} 
                  onChange={(e) => setDocs({...docs, [doc]: e.target.checked})}
                  className="mt-1 w-5 h-5 accent-primary border-gray-300 rounded"
                />
                <span className={`text-sm ${docs[doc] ? "line-through text-text-subtle" : "text-foreground font-medium"}`}>
                  {doc}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* How to Apply */}
        <section className="bg-surface rounded-xl p-4 border border-border shadow-sm">
          <h3 className="font-bold mb-3">{t.apply_section}</h3>
          <ol className="list-decimal pl-5 text-sm text-text-subtle space-y-2 mb-5 font-medium">
            <li>{t.apply_step1}</li>
            <li>{t.apply_step2}</li>
            <li>{t.apply_step3}</li>
            <li>{t.apply_step4}</li>
          </ol>
          
          <div className="flex gap-2">
            <Button className="flex-1 flex gap-2" onClick={() => window.open(scheme.official_url, "_blank")}>
              <ExternalLink className="w-4 h-4" /> {t.official_site}
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
