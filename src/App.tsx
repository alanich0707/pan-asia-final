
import React, { useState, useEffect } from 'react';
import { User, Page, Language, MedicalRecord, Promotion } from './types';
import { TRANSLATIONS, MOCK_WORKER_DATABASE, EMPLOYERS, MONTHLY_PROMOTIONS, BLOOD_TYPES } from './constants';
import { getAssistantResponse } from './services/geminiService';
import Navigation from './Navigation';
import { 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight,
  Send,
  Loader2,
  X,
  Languages,
  Calendar,
  HeartPulse,
  PhoneCall,
  WifiOff,
  Search,
  Filter,
  Activity,
  BookOpen,
  Scale,
  Settings,
  Star,
  Trophy,
  ShoppingBag,
  Gift,
  CheckCircle,
  Building2,
  Users
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [passport, setPassport] = useState('');
  const [dob, setDob] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pointToast, setPointToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminFilterEmployer, setAdminFilterEmployer] = useState('all');
  
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [isEditingBloodType, setIsEditingBloodType] = useState(false);
  const [newMedicalRecord, setNewMedicalRecord] = useState<{ date: string, type: 'checkup' | 'treatment', description: string }>({
    date: new Date().toISOString().split('T')[0],
    type: 'treatment',
    description: ''
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const storedWorkers = localStorage.getItem('pan_asia_workers');
    if (storedWorkers) {
      setWorkers(JSON.parse(storedWorkers));
    } else {
      setWorkers(MOCK_WORKER_DATABASE);
      localStorage.setItem('pan_asia_workers', JSON.stringify(MOCK_WORKER_DATABASE));
    }

    const cachedUser = localStorage.getItem('pan_asia_user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setCurrentPage(parsedUser.role === 'admin' ? Page.ADMIN : Page.DASHBOARD);
      } catch (e) {
        console.error("Failed to parse cached user", e);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerPointToast = (message: string) => {
    setPointToast({ show: true, msg: message });
    setTimeout(() => setPointToast({ show: false, msg: '' }), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = passport.trim();
    const cleanPwd = dob.trim();

    // 管理者登入邏輯: ALAN / ICH
    if (cleanId.toUpperCase() === 'ALAN' && cleanPwd === 'ICH') {
      const adminUser: User = {
        passportNumber: 'ALAN',
        birthDate: 'ICH',
        name: 'ADMIN: ALAN',
        employer: 'pan_asia',
        workerId: 'ADMIN-01',
        bloodType: 'N/A',
        allergies: [],
        passportExpiry: '9999-12-31',
        medicalCheckupDate: '9999-12-31',
        entryDate: '9999-12-31',
        entryType: 'abroad',
        emergencyContact: { name: 'Support', relationship: 'HQ', phone: '0800' },
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('pan_asia_user', JSON.stringify(adminUser));
      setCurrentPage(Page.ADMIN);
      setLoginError('');
      return;
    }

    // 移工登入邏輯
    const foundUserIndex = workers.findIndex(u => u.passportNumber.toUpperCase() === cleanId.toUpperCase() && u.birthDate === cleanPwd);

    if (foundUserIndex !== -1) {
      let foundUser = workers[foundUserIndex];
      const currentMonth = new Date().toISOString().substring(0, 7);
      
      let pointsAwarded = false;
      if (foundUser.lastLoginMonth !== currentMonth) {
        const updatedPoints = (foundUser.points || 0) + 1;
        foundUser = { ...foundUser, points: updatedPoints, lastLoginMonth: currentMonth };
        const updatedWorkers = [...workers];
        updatedWorkers[foundUserIndex] = foundUser;
        setWorkers(updatedWorkers);
        localStorage.setItem('pan_asia_workers', JSON.stringify(updatedWorkers));
        pointsAwarded = true;
      }

      setUser(foundUser);
      setLoginError('');
      localStorage.setItem('pan_asia_user', JSON.stringify(foundUser));
      setCurrentPage(Page.DASHBOARD);
      if (pointsAwarded) setTimeout(() => triggerPointToast(t.login_bonus), 1000);
    } else {
      setLoginError(t.login_err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(Page.LOGIN);
    setPassport('');
    setDob('');
    localStorage.removeItem('pan_asia_user');
  };

  const handleConfirmPromotion = (id: string) => {
    if (!user) return;
    const currentRead = user.readPromotions || [];
    if (currentRead.includes(id)) return;

    const updatedPoints = (user.points || 0) + 1;
    const updatedUser = { ...user, readPromotions: [...currentRead, id], points: updatedPoints };
    const updatedWorkers = workers.map(w => w.passportNumber === user.passportNumber ? updatedUser : w);
    
    setWorkers(updatedWorkers);
    setUser(updatedUser);
    localStorage.setItem('pan_asia_workers', JSON.stringify(updatedWorkers));
    localStorage.setItem('pan_asia_user', JSON.stringify(updatedUser));
    triggerPointToast(t.reading_bonus);
  };

  const handleUpdateBloodType = (newType: string) => {
    if (!user) return;
    const updatedUser = { ...user, bloodType: newType };
    const updatedWorkers = workers.map(w => w.passportNumber === user.passportNumber ? updatedUser : w);
    setWorkers(updatedWorkers);
    setUser(updatedUser);
    localStorage.setItem('pan_asia_workers', JSON.stringify(updatedWorkers));
    localStorage.setItem('pan_asia_user', JSON.stringify(updatedUser));
    setIsEditingBloodType(false);
  };

  const handleAddMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const record: MedicalRecord = {
      id: Date.now().toString(),
      date: newMedicalRecord.date,
      type: newMedicalRecord.type,
      description: newMedicalRecord.description
    };
    const updatedUser = { ...user, medicalHistory: [record, ...(user.medicalHistory || [])] };
    const updatedWorkers = workers.map(w => w.passportNumber === user.passportNumber ? updatedUser : w);
    setWorkers(updatedWorkers);
    setUser(updatedUser);
    localStorage.setItem('pan_asia_workers', JSON.stringify(updatedWorkers));
    localStorage.setItem('pan_asia_user', JSON.stringify(updatedUser));
    setShowMedicalForm(false);
    setNewMedicalRecord({ date: new Date().toISOString().split('T')[0], type: 'treatment', description: '' });
  };

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return 0;
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  const calculateNextMedical = (entryDate: string, entryType: 'abroad' | 'domestic') => {
    if (!entryDate) return null;
    const entry = new Date(entryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (entryType === 'abroad') {
      for (const m of [6, 18, 30]) {
        const mDate = new Date(entry);
        mDate.setMonth(mDate.getMonth() + m);
        if (mDate >= now) return mDate.toISOString().split('T')[0];
      }
      return null;
    } else {
      let months = 12;
      while (months < 120) {
        const mDate = new Date(entry);
        mDate.setMonth(mDate.getMonth() + months);
        if (mDate >= now) return mDate.toISOString().split('T')[0];
        months += 12;
      }
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const currentInput = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setIsTyping(true);
    try {
      const response = await getAssistantResponse(currentInput, chatHistory, lang);
      setChatHistory(prev => [...prev, { role: 'model', text: response || '' }]);
    } catch (error) { console.error(error); } finally { setIsTyping(false); }
  };

  const PointsToast = () => (
    <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[300] bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 transition-all duration-500 ${pointToast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce"><Star size={24} fill="white" /></div>
      <div>
        <p className="font-black text-xs uppercase tracking-tight">{t.points_earned}</p>
        <p className="text-[10px] font-bold opacity-90">{pointToast.msg}</p>
      </div>
    </div>
  );

  const OfflineBanner = () => !isOnline ? (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 flex items-center justify-center gap-2">
      <WifiOff size={12} /> {lang === 'en' ? 'Offline Mode' : '離線模式'}
    </div>
  ) : null;

  // --- VIEWS ---

  const LoginView = () => (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-6 bg-[#0A192F]">
      <OfflineBanner />
      <div className="w-full max-w-sm z-20">
        <div className="mb-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
               <span className="text-blue-900 font-black text-4xl tracking-tighter">PA</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase mb-1">{isAdminMode ? t.admin_title : t.login_title}</h1>
          <p className="text-blue-200 font-medium text-sm">{isAdminMode ? t.admin_subtitle : t.login_subtitle}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-center mb-8">
            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} 
              className="bg-white/10 px-6 py-3 rounded-full border border-white/20 text-xs font-black text-white flex items-center gap-3 hover:bg-white/20 transition-all active:scale-95 group shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Languages size={16} className="text-white" /> 
              </div>
              <div className="flex flex-col items-start text-left">
                 <span className="text-[10px] opacity-70">LANGUAGE / 語系</span>
                 <span>{lang === 'en' ? 'CHINESE 中文' : 'ENGLISH 英文'}</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-yellow-400 uppercase ml-1 flex gap-2">
                <UserIcon size={12} /> {isAdminMode ? t.admin_user : t.passport}
              </label>
              <input 
                type="text" 
                placeholder={isAdminMode ? "Admin ID" : "F126155168"} 
                className="w-full bg-white/20 rounded-2xl py-4 px-5 mt-2 outline-none text-white font-bold border border-white/0 focus:border-yellow-400 transition-all uppercase" 
                value={passport} 
                onChange={(e) => setPassport(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-yellow-400 uppercase ml-1 flex gap-2">
                <Lock size={12} /> {isAdminMode ? t.admin_pwd : t.dob}
              </label>
              <input 
                type="password" 
                placeholder={isAdminMode ? "••••••••" : "YYYYMMDD"} 
                className="w-full bg-white/20 rounded-2xl py-4 px-5 mt-2 outline-none text-white font-bold border border-white/0 focus:border-yellow-400 transition-all" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                required 
              />
            </div>
            {loginError && <div className="text-red-300 text-[11px] font-black text-center animate-pulse">{loginError}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 text-white font-black py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 mt-4 hover:brightness-110 active:scale-95 transition-all">
              {isAdminMode ? t.admin_btn : t.login_btn} <ArrowRight size={22} />
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <button 
              onClick={() => { setIsAdminMode(!isAdminMode); setPassport(''); setDob(''); setLoginError(''); }}
              className="text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ShieldCheck size={14} />
              {isAdminMode ? t.switch_to_worker : t.switch_to_admin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminView = () => {
    const filteredWorkers = workers.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) || 
                          w.passportNumber.toLowerCase().includes(adminSearchTerm.toLowerCase());
      const matchEmployer = adminFilterEmployer === 'all' || w.employer === adminFilterEmployer;
      return matchSearch && matchEmployer;
    });

    return (
      <div className="min-h-screen pb-24 bg-[#F1F5F9]">
        <div className="bg-[#0A192F] text-white p-8 rounded-b-[3rem] shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-blue-300/70 text-[10px] font-black uppercase tracking-widest mb-1">{t.admin_sys_name}</p>
              <h2 className="text-2xl font-black">{t.admin_title}</h2>
            </div>
            <button onClick={handleLogout} className="p-3 bg-white/10 rounded-2xl hover:bg-red-500 transition-colors"><X size={20} /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/5">
              <p className="text-[10px] font-black text-blue-300 uppercase mb-1">{t.admin_total_workers}</p>
              <p className="text-3xl font-black">{workers.length}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/5">
              <p className="text-[10px] font-black text-blue-300 uppercase mb-1">{t.admin_active_rewards}</p>
              <p className="text-3xl font-black text-yellow-400">{workers.reduce((acc, w) => acc + (w.points || 0), 0)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-6 border border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl mb-4">
              <Search className="text-gray-400" size={18} />
              <input 
                className="bg-transparent flex-1 outline-none font-bold text-sm" 
                placeholder={t.admin_search_placeholder}
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
              <Filter className="text-gray-400" size={18} />
              <select 
                className="bg-transparent flex-1 outline-none font-bold text-sm"
                value={adminFilterEmployer}
                onChange={(e) => setAdminFilterEmployer(e.target.value)}
              >
                <option value="all">{t.admin_all_employers}</option>
                {EMPLOYERS.map(emp => <option key={emp.id} value={emp.id}>{lang === 'en' ? emp.name : emp.name_zh}</option>)}
              </select>
            </div>
          </div>

          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 flex items-center gap-2">
            <Users size={14} /> {t.admin_worker_db} ({filteredWorkers.length})
          </h3>

          <div className="space-y-4">
            {filteredWorkers.map(w => {
              const employer = EMPLOYERS.find(e => e.id === w.employer);
              return (
                <div key={w.passportNumber} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group active:scale-95 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">{w.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-black text-gray-800 text-sm leading-tight">{w.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        {lang === 'en' ? employer?.name : employer?.name_zh} • {w.passportNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} className="text-orange-500" fill="currentColor" />
                      <span className="text-[10px] font-black text-orange-600">{w.points || 0} {t.points_unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const passportDays = user ? getDaysDiff(user.passportExpiry) : 0;
    const nextMed = user?.entryDate ? calculateNextMedical(user.entryDate, user.entryType) : null;
    const medDays = nextMed ? getDaysDiff(nextMed) : 0;
    const unreadCount = MONTHLY_PROMOTIONS.filter(p => !user?.readPromotions?.includes(p.id)).length;
    const employer = EMPLOYERS.find(e => e.id === user?.employer);

    return (
      <div className="pb-24">
        <OfflineBanner />
        <PointsToast />
        <div className="bg-[#0A192F] text-white pt-12 pb-14 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center mb-8">
            <div>
              <p className="text-blue-300/70 text-xs font-bold uppercase mb-1">{t.welcome}</p>
              <h2 className="text-2xl font-black">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Building2 size={12} className="text-yellow-400" />
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                  {lang === 'en' ? employer?.name : employer?.name_zh}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-3 bg-white/10 rounded-2xl"><X size={20} /></button>
          </div>
        </div>

        <div className="px-6 -mt-8 relative z-20">
          <div onClick={() => setCurrentPage(Page.REWARDS)} className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-[2.5rem] shadow-xl text-white mb-6 cursor-pointer active:scale-95 transition-all">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{t.my_points}</p>
                   <div className="flex items-center gap-2">
                      <Star size={32} fill="currentColor" /><span className="text-4xl font-black tracking-tighter">{user?.points || 0}</span><span className="text-sm font-black uppercase tracking-widest ml-1">{t.points_unit}</span>
                   </div>
                </div>
                <Trophy size={48} className="opacity-40" />
             </div>
          </div>

          {unreadCount > 0 && (
            <div onClick={() => setCurrentPage(Page.PROMOTIONS)} className="bg-red-600 p-6 rounded-[2.5rem] shadow-xl text-white mb-6 flex items-center justify-between animate-pulse cursor-pointer">
              <div className="flex items-center gap-4"><BookOpen size={24} /><div><p className="font-black text-sm uppercase tracking-tight">{t.new_promotion}</p><p className="text-[10px] opacity-80 font-bold">{unreadCount} Topic(s)</p></div></div><ChevronRight size={24} />
            </div>
          )}

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 mb-8">
            <h3 className="font-black text-gray-800 mb-5 flex items-center gap-3"><Calendar className="text-blue-600" size={20}/> {t.important_reminders}</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${passportDays < 90 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><AlertTriangle size={22} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase">{t.passport_expiry}</p><p className="text-base font-black text-gray-800">{user?.passportExpiry}</p></div>
                  </div>
               </div>
               {nextMed && (
                 <div className="flex flex-col p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${medDays < 30 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}><HeartPulse size={22} /></div>
                      <div><p className="text-[10px] font-black text-gray-400 uppercase leading-tight">{t.medical_due}</p><p className="text-base font-black text-gray-800">{nextMed}</p></div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RewardsView = () => (
    <div className="p-6 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="pt-8 mb-8">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{t.my_points}</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.rewards_desc}</p>
      </div>
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={120} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase opacity-80 mb-2">{t.my_points}</p>
          <div className="flex items-center gap-3">
            <Star size={40} fill="white" />
            <span className="text-6xl font-black tracking-tighter">{user?.points || 0}</span>
            <span className="text-xl font-black uppercase ml-1 opacity-80">{t.points_unit}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: '7-11 Voucher (NT$100)', pts: 20, icon: <Gift className="text-green-500" /> },
          { name: 'OK Mart Card (NT$50)', pts: 10, icon: <Gift className="text-red-500" /> }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center opacity-60 grayscale cursor-not-allowed">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">{item.icon}</div>
            <p className="text-[10px] font-black text-gray-800 leading-tight mb-2 text-center">{item.name}</p>
            <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1">
              <Star size={10} className="text-orange-500" fill="currentColor" />
              <span className="text-[10px] font-black text-orange-600">{item.pts} {t.points_unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PromotionView = () => {
    if (selectedPromotion) {
      const isRead = user?.readPromotions?.includes(selectedPromotion.id);
      return (
        <div className="p-6 pb-24 min-h-screen bg-white">
          <PointsToast /><button onClick={() => setSelectedPromotion(null)} className="p-3 bg-gray-50 rounded-2xl mb-8"><ArrowRight className="rotate-180" size={20}/></button>
          <h2 className="text-xl font-black mb-6">{lang === 'en' ? selectedPromotion.title : selectedPromotion.title_zh}</h2>
          <div className="bg-blue-50 p-6 rounded-[2.5rem] mb-10 font-bold text-gray-700 whitespace-pre-wrap">
            {lang === 'en' ? selectedPromotion.content : selectedPromotion.content_zh}
          </div>
          {!isRead ? (
            <button onClick={() => handleConfirmPromotion(selectedPromotion.id)} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3">
              <ShieldCheck size={24} /> {t.mark_as_read} <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px]">+1 Pt</div>
            </button>
          ) : (
            <div className="w-full bg-green-50 text-green-600 font-black py-5 rounded-2xl flex items-center justify-center gap-3 border border-green-200">
              <CheckCircle size={24} /> {t.read_confirmed}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="p-6 pb-24 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-black mb-8 pt-8 text-gray-800 uppercase">{t.promotions}</h2>
        <div className="space-y-4">
          {MONTHLY_PROMOTIONS.map(promo => {
            const isRead = user?.readPromotions?.includes(promo.id);
            return (
              <div key={promo.id} onClick={() => setSelectedPromotion(promo)} className={`bg-white p-6 rounded-[2.5rem] border flex justify-between items-center shadow-sm cursor-pointer ${isRead ? 'opacity-70' : 'border-red-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRead ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-600'}`}><Scale size={24} /></div>
                  <h3 className="font-black text-gray-800 text-sm">{lang === 'en' ? promo.title : promo.title_zh}</h3>
                </div>
                {!isRead && <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg animate-pulse">{t.unread}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const EmergencyView = () => (
    <div className="p-6 pb-24">
      <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="p-3 bg-white shadow-md rounded-2xl mb-8"><ArrowRight className="rotate-180" size={20}/></button>
      <h2 className="text-2xl font-black mb-8 text-gray-800 uppercase">{t.emergency}</h2>
      <div className="bg-red-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-8">
        <h3 className="text-xl font-black mb-4">{t.one_tap_help}</h3>
        <div className="space-y-4">
          <a href="tel:110" className="block w-full bg-white text-red-600 py-4 rounded-2xl text-center font-black">{t.call_police}</a>
          <a href="tel:119" className="block w-full bg-red-700 text-white py-4 rounded-2xl text-center font-black">{t.call_ambulance}</a>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100">
         <h4 className="text-xs font-black uppercase text-gray-400 mb-4">{t.emergency_contact}</h4>
         <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="font-black text-gray-800">{user?.emergencyContact.name}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{user?.emergencyContact.relationship}</p>
            <a href={`tel:${user?.emergencyContact.phone}`} className="text-blue-600 font-black flex items-center gap-2"><PhoneCall size={14}/> {user?.emergencyContact.phone}</a>
         </div>
      </div>
    </div>
  );

  const AiAssistantView = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      <div className="p-6 bg-[#0A192F] text-white rounded-b-[2rem] pt-12">
        <h2 className="text-xl font-black uppercase">{t.ai_title}</h2>
        <p className="text-[10px] text-blue-300 font-bold uppercase">{t.ai_subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
        {chatHistory.map((chat, i) => (
          <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm ${chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>{chat.text}</div>
          </div>
        ))}
        {isTyping && <Loader2 className="animate-spin text-gray-400 mx-auto" />}
      </div>
      <div className="p-4 bg-white border-t border-gray-100 pb-8">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl">
          <input className="flex-1 bg-transparent py-2 px-1 outline-none text-sm font-bold" placeholder={t.ask_anything} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
          <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );

  const MedicalCardView = () => (
    <div className="p-6 pb-24 bg-gray-50 min-h-screen">
      <button onClick={() => setCurrentPage(Page.DASHBOARD)} className="p-3 bg-white shadow-md rounded-2xl mb-8"><ArrowRight className="rotate-180" size={20}/></button>
      <h2 className="text-2xl font-black mb-6 text-gray-800 uppercase">{t.health_card}</h2>
      <div className="bg-teal-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-8">
        <p className="text-teal-200 text-[10px] font-black mb-2 uppercase">{t.health_id}</p><h3 className="text-2xl font-black mb-8">{user?.name}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-teal-200 text-[9px] font-black uppercase">{t.worker_id}</p><p className="font-bold">{user?.workerId}</p></div>
          <div><p className="text-teal-200 text-[9px] font-black uppercase mb-1">{t.blood_type}</p>
            {isEditingBloodType ? <select className="bg-teal-600 text-white font-bold rounded px-2 py-1 outline-none text-sm" value={user?.bloodType} onChange={(e) => handleUpdateBloodType(e.target.value)} onBlur={() => setIsEditingBloodType(false)} autoFocus>{BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}</select> : <p onClick={() => setIsEditingBloodType(true)} className="font-bold cursor-pointer">{user?.bloodType} <Settings size={10} className="inline opacity-50"/></p>}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase tracking-widest">{t.medical_history}</h3><button onClick={() => setShowMedicalForm(true)} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md">+ {t.add_record}</button></div>
        {user?.medicalHistory?.map(record => (
          <div key={record.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-50 text-teal-600"><Activity size={20}/></div>
            <div><p className="text-[10px] font-black text-gray-400">{record.date}</p><p className="text-sm font-bold text-gray-800">{lang === 'en' ? record.description : (record.description_zh || record.description)}</p></div>
          </div>
        ))}
      </div>
      {showMedicalForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-gray-800">{t.add_record}</h3><button onClick={() => setShowMedicalForm(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button></div>
            <form onSubmit={handleAddMedicalRecord} className="space-y-5 pb-10">
              <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" value={newMedicalRecord.date} onChange={e => setNewMedicalRecord({...newMedicalRecord, date: e.target.value})} required />
              <textarea rows={3} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" placeholder={t.desc_label} value={newMedicalRecord.description} onChange={e => setNewMedicalRecord({...newMedicalRecord, description: e.target.value})} required />
              <button type="submit" className="w-full bg-teal-600 text-white font-black py-4 rounded-2xl shadow-xl">{t.save_record}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
  if (currentPage === Page.LOGIN) return <LoginView />;
  if (currentPage === Page.ADMIN) return <AdminView />;

  return (
    <div className="max-w-md mx-auto bg-[#F8FAFC] min-h-screen relative shadow-2xl overflow-x-hidden">
      {currentPage === Page.DASHBOARD && <DashboardView />}
      {currentPage === Page.REWARDS && <RewardsView />}
      {currentPage === Page.PROMOTIONS && <PromotionView />}
      {currentPage === Page.EMERGENCY && <EmergencyView />}
      {currentPage === Page.AI_ASSISTANT && <AiAssistantView />}
      {currentPage === Page.MEDICAL_CARD && <MedicalCardView />}
      <Navigation currentPage={currentPage} setPage={setCurrentPage} lang={lang} isAdmin={user?.role === 'admin'} />
    </div>
  );
};

export default App;
