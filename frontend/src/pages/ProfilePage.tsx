

import { useState, useEffect } from "react";
import { 
  UserCircle, 
  Bell, 
  HelpCircle, 
  ChevronRight, 
  LogOut, 
  Globe, 
  Check, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  ShieldAlert,
  CloudRain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { id: "hi", label: "हिंदी" },
  { id: "en", label: "English" },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "scheme" | "weather" | "fraud" | "system";
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "PM-KISAN 17th Kist Status",
    message: "Aapki 17vi kist ₹2,000 bank khate me saphalta-purvak credit kar di gayi hai.",
    time: "Today, 10:30 AM",
    type: "scheme",
    read: false,
  },
  {
    id: "n2",
    title: "Mausam Chetavani (Durg)",
    message: "Agle 48 ghantho me halki se madhyam barish ki sambhavna. Keetnashak chidkaav ko sthagit karein.",
    time: "Yesterday, 4:15 PM",
    type: "weather",
    read: false,
  },
  {
    id: "n3",
    title: "Fraud Alert (सावधान)",
    message: "PM-KISAN ke naam par ₹200 fee maangne wale fake link par click na karein. Sarkar koi fee nahi leti.",
    time: "08 Sep 2026",
    type: "fraud",
    read: true,
  },
  {
    id: "n4",
    title: "SMAM Tractor Subsidy Open",
    message: "Tractor va krishi yantron par 50% subsidy ke liye aavedan shuru ho gaye hain.",
    time: "05 Sep 2026",
    type: "scheme",
    read: true,
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, lang: currentLang, setLang } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    district: "",
    state: "",
    landSize: "",
    crops: "",
    category: "",
  });

  // Temporary Edit Form State
  const [editForm, setEditForm] = useState({ ...profile });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("app_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState(() => {
    const saved = localStorage.getItem("notif_prefs");
    return saved ? JSON.parse(saved) : { scheme: true, weather: true, fraud: true };
  });

  // Load initial profile data on mount
  useEffect(() => {
    const loadedProfile = {
      name: localStorage.getItem("user_name") || "Ramesh Kumar",
      phone: localStorage.getItem("user_phone") || "9876543210",
      district: localStorage.getItem("user_district") || "Durg",
      state: localStorage.getItem("user_state") || "Chhattisgarh",
      landSize: localStorage.getItem("user_land_size") || "3 Acres",
      crops: localStorage.getItem("user_crops") || "Wheat, Paddy",
      category: localStorage.getItem("user_category") || "OBC",
    };
    setProfile(loadedProfile);
    setEditForm(loadedProfile);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLangChange = (langId: string) => {
    setLang(langId as any);
    setShowLangPicker(false);
    triggerToast("भाषा बदल दी गई (Language updated)");
  };

  const handleOpenEdit = () => {
    setEditForm({ ...profile });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) return;

    setProfile(editForm);
    localStorage.setItem("user_name", editForm.name);
    localStorage.setItem("user_phone", editForm.phone);
    localStorage.setItem("user_district", editForm.district);
    localStorage.setItem("user_state", editForm.state);
    localStorage.setItem("user_land_size", editForm.landSize);
    localStorage.setItem("user_crops", editForm.crops);
    localStorage.setItem("user_category", editForm.category);

    // Call Backend API to sync profile
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
    } catch (e) {
      console.warn("Backend profile sync failed:", e);
    }

    setShowEditModal(false);
    triggerToast("प्रोफ़ाइल अपडेट हो गई! (Profile saved successfully)");
  };

  const handleTogglePref = (key: "scheme" | "weather" | "fraud") => {
    const updated = { ...notifPreferences, [key]: !notifPreferences[key] };
    setNotifPreferences(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("app_notifications", JSON.stringify(updated));
    triggerToast("सभी नोटिफिकेशन पढ़े गए (All marked as read)");
  };

  const handleLogout = () => {
    if (window.confirm("क्या आप लॉग आउट करना चाहते हैं? (Are you sure you want to logout?)")) {
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_phone");
      navigate("/");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentLangLabel = languages.find(l => l.id === currentLang)?.label || "हिंदी";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-white p-4 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t.profile_title}</h1>
          <p className="text-xs opacity-90">{t.profile_subtitle}</p>
        </div>
        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {t.edit_profile_btn}
        </button>
      </header>

      <main className="p-4 flex-1 overflow-y-auto max-w-2xl mx-auto w-full space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4 relative">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-sm">
            <UserCircle className="w-10 h-10" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-lg text-slate-800">{profile.name}</h2>
              {profile.category && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {profile.category}
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {profile.district}, {profile.state}
            </p>
            
            <p className="text-xs text-slate-600 flex items-center gap-1 mb-1 font-medium">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              {profile.landSize} • {profile.crops}
            </p>
            
            {profile.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 {profile.phone}
              </p>
            )}
          </div>

          <button
            onClick={handleOpenEdit}
            className="text-primary hover:bg-emerald-50 p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>

        {/* Action List */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <button 
            onClick={() => setShowLangPicker(true)}
            className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-primary">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">{t.lang_label}</span>
            </div>
            <div className="flex items-center gap-2 text-text-subtle">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-sm font-medium border border-green-200">
                {languages.find(l => l.id === currentLang)?.label}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button 
            onClick={() => setShowNotificationModal(true)}
            className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">{t.notif_label}</span>
            </div>
            <div className="flex items-center gap-2 text-text-subtle">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button 
            onClick={() => setShowHelpModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">{t.help_label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle" />
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-red-100 text-red-600 font-bold shadow-sm hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t.logout_btn}
        </button>
      </main>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Edit3 className="w-5 h-5" />
                Edit Profile / प्रोफाइल संपादित करें
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name / पूरा नाम *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mobile Number / मोबाइल नंबर
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    District / जिला
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State / राज्य
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Land Size / जमीन
                  </label>
                  <input
                    type="text"
                    value={editForm.landSize}
                    placeholder="e.g. 3 Acres"
                    onChange={(e) => setEditForm({ ...editForm, landSize: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category / वर्ग
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Crops / प्रमुख फसलें
                </label>
                <input
                  type="text"
                  value={editForm.crops}
                  placeholder="e.g. Wheat, Paddy, Pulses"
                  onChange={(e) => setEditForm({ ...editForm, crops: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button fullWidth onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes / सहेजें
                </Button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATIONS MODAL ================= */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Bell className="w-5 h-5 text-amber-200" />
                Notifications Center / सूचनाएं
              </div>
              <button 
                onClick={() => setShowNotificationModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Notification Toggles */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Notification Settings (सेटिंग्स):</p>

                <div className="flex items-center justify-between text-xs font-medium text-slate-800 py-1">
                  <span>🌾 Scheme & Kist Updates</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.scheme}
                    onChange={() => handleTogglePref("scheme")}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-800 py-1">
                  <span>🌦️ Weather Advisories</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.weather}
                    onChange={() => handleTogglePref("weather")}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-800 py-1">
                  <span>🚨 Fraud & Scam Warnings</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.fraud}
                    onChange={() => handleTogglePref("fraud")}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Notification Header & Mark Read */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-600 uppercase">Recent Alerts ({notifications.length})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="space-y-2.5">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.read
                        ? "bg-slate-50 border-slate-200"
                        : "bg-amber-50/50 border-amber-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {item.type === "scheme" && <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {item.type === "weather" && <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />}
                        {item.type === "fraud" && <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />}
                        <h5 className="font-bold text-sm text-slate-800">{item.title}</h5>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-6">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HELP & SUPPORT MODAL ================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg">
                <HelpCircle className="w-5 h-5" />
                Help & Kisan Helpline / मदद
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                <h4 className="font-bold text-blue-900 text-sm">📞 Toll-Free Kisan Helpline Numbers:</h4>
                <div className="flex justify-between items-center p-2 bg-white rounded-xl border border-blue-100">
                  <span className="font-semibold text-slate-700">Kisan Call Centre (KCC):</span>
                  <a href="tel:18001801551" className="font-bold text-primary hover:underline">1800-180-1551</a>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-xl border border-blue-100">
                  <span className="font-semibold text-slate-700">PM-KISAN Helpline:</span>
                  <a href="tel:155261" className="font-bold text-primary hover:underline">155261 / 011-24300606</a>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-xl border border-blue-100">
                  <span className="font-semibold text-slate-700">Krishi Vibhag Chhattisgarh:</span>
                  <a href="tel:07712443000" className="font-bold text-primary hover:underline">0771-2443000</a>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Frequently Asked Questions (अक्सर पूछे जाने वाले सवाल):</h4>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="font-bold text-xs text-slate-800 mb-1">Q. PM-KISAN ki kist nahi aayi toh kya karein?</p>
                  <p className="text-xs text-slate-600">Apne Aadhaar card se Bank Account link check karein aur CSC center par e-KYC verified hona sunishchit karein.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="font-bold text-xs text-slate-800 mb-1">Q. Kisan Credit Card (KCC) loan kaise lein?</p>
                  <p className="text-xs text-slate-600">Apni land passbook (B-1/Khasra) aur Aadhaar card ke sath najdiki Gramin Bank ya Co-operative Bank me aavedan karein.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= LANGUAGE PICKER MODAL ================= */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Globe className="w-5 h-5" />
                Select Language / भाषा चुनें
              </div>
              <button 
                onClick={() => setShowLangPicker(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {languages.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border font-semibold flex items-center justify-between transition-colors ${
                    currentLang === l.id 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                  {currentLang === l.id && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
