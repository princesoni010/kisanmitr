

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Search, X, MapPin, Sprout, ArrowRight, ShieldCheck, Sparkles, Filter, CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SchemesPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: t.cat_all },
    { id: "income_support", label: t.cat_income },
    { id: "irrigation", label: t.cat_irrigation },
    { id: "credit_loan", label: t.cat_credit },
    { id: "insurance", label: t.cat_insurance },
    { id: "equipment", label: t.cat_equipment },
    { id: "social_security", label: t.cat_pension },
    { id: "advisory", label: t.cat_advisory },
  ];

  // User profile from localStorage for dynamic eligibility checks
  const farmerName = localStorage.getItem("user_name") || "Ramesh Kumar";
  const farmerDistrict = localStorage.getItem("user_district") || "Durg";
  const farmerState = localStorage.getItem("user_state") || "Chhattisgarh";
  const farmerLand = localStorage.getItem("user_land_size") || "3 Acres";
  const farmerCrops = localStorage.getItem("user_crops") || "Wheat, Paddy";

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => {
        setSchemes(data.schemes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter schemes by category and search query
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesCategory = activeCategory === "all" || scheme.type === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      scheme.name.toLowerCase().includes(q) ||
      scheme.benefits.toLowerCase().includes(q) ||
      scheme.type.toLowerCase().includes(q) ||
      (scheme.coverage && scheme.coverage.some((c: string) => c.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <div>
            <h1 className="text-xl font-bold">{t.schemes_title}</h1>
            <p className="text-xs opacity-90">{t.schemes_subtitle}</p>
          </div>
        </div>
      </header>

      <main className="p-4 flex-1 overflow-y-auto max-w-2xl mx-auto w-full space-y-4">
        {/* Farmer Profile Context Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {farmerName} ({farmerDistrict}, {farmerState})
              </p>
              <p className="text-[11px] text-emerald-800">
                {farmerLand} • {farmerCrops} • {filteredSchemes.length} {t.available_schemes}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {t.verified_badge}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white shadow-sm text-slate-800 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interactive Top Horizontal Slide Bar / Filter Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-primary" /> {t.filter_label}
            </span>
            <span className="text-primary font-semibold">
              {filteredSchemes.length} {t.found_label}
            </span>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none snap-x cursor-grab active:cursor-grabbing">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const catCount =
                cat.id === "all"
                  ? schemes.length
                  : schemes.filter((s) => s.type === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 snap-start px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm font-semibold text-slate-700">{t.loading_schemes}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSchemes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base mb-1">{t.no_scheme_found}</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
              {t.no_scheme_msg}
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t.reset_filter}
            </button>
          </div>
        )}

        {/* Scheme Cards List */}
        {!loading && filteredSchemes.length > 0 && (
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => {
              const isRolling = scheme.deadline === "rolling" || scheme.deadline === "Rolling" || scheme.deadline?.toLowerCase() === "ongoing";
              
              return (
                <div
                  key={scheme.scheme_id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Top Row: Title & Eligibility Badge */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                        {scheme.coverage?.includes("Chhattisgarh") ? t.cg_badge : t.all_india_badge}
                      </span>
                      <h2 className="font-bold text-base text-slate-800 leading-snug">
                        {scheme.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {t.likely_eligible}
                    </div>
                  </div>

                  {/* Eligibility Bullet points tailored to user */}
                  <ul className="text-xs text-slate-600 mb-3 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {t.land_eligibility.replace('{land}', farmerLand)}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {t.state_eligibility.replace('{state}', farmerState)}
                    </li>
                  </ul>

                  {/* Benefit Highlight Box */}
                  <div className="flex items-center gap-2.5 mb-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                    <span className="text-xl shrink-0">💰</span>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">{t.benefit_label}:</p>
                      <p className="font-bold text-xs text-slate-800 leading-tight">
                        {scheme.benefits}
                      </p>
                    </div>
                  </div>

                  {/* Deadline Box */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 px-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5 text-primary" /> {t.deadline_label}:
                    </span>
                    <span className={isRolling ? "text-emerald-700 font-semibold" : "text-orange-700 font-semibold"}>
                      {isRolling ? t.deadline_rolling : scheme.deadline || "TBA"}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    <Link
                      to={`/schemes/${scheme.scheme_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 font-bold rounded-xl transition-colors text-xs"
                    >
                      {t.view_checklist} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

