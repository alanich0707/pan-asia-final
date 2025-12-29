
import React from 'react';
import { 
  Utensils, 
  Shirt, 
  Home, 
  Bus, 
  Gamepad2,
  Bell,
  HeartPulse,
  PhoneCall,
  LayoutDashboard,
  MessageSquareQuote,
  ShieldCheck,
  Building2,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { LifeService, Announcement, Page, User, Employer, Promotion } from './types';

export const EMPLOYERS: Employer[] = [
  { id: 'supermicro', name: 'Supermicro', name_zh: '美超微電腦' },
  { id: 'delta', name: 'Delta Electronics', name_zh: '台達電子' },
  { id: 'foxconn', name: 'Foxconn', name_zh: '鴻海精密' },
  { id: 'advantech', name: 'Advantech Co., Ltd.', name_zh: '研華股份有限公司' },
  { id: 'platinum', name: 'Platinum Technology', name_zh: '白金科技股份有限公司' },
  { id: 'ykk', name: 'Taiwan YKK Co., Ltd.', name_zh: '台灣華可貴股份有限公司' }
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export const MONTHLY_PROMOTIONS: Promotion[] = [
  {
    id: 'prop-2024-05',
    title: 'Gender Equality & Anti-Harassment',
    title_zh: '性別平等與性騷擾防治宣導',
    date: '2024-05-01',
    icon: 'ShieldCheck',
    content: `Taiwan strictly enforces the "Gender Equity Education Act" and "Gender Equality in Employment Act". 
    1. ZERO TOLERANCE: Any unwanted physical contact, verbal jokes, or visual offensive material is forbidden.
    2. RIGHTS: You have the right to a safe workplace. Employers must provide a harassment-free environment.
    3. CASE STUDY: A worker was touched inappropriately by a colleague. She reported to the coordinator. The colleague was fined and the employer provided psychological support.
    4. HOTLINE: If you feel uncomfortable, call 113 or talk to your PAN-ASIA coordinator.`,
    content_zh: `台灣嚴格執行「性別平等教育法」與「性別平等工作法」。
    1. 零容忍政策：嚴禁任何未經允許的肢體接觸、言語笑話或冒犯性內容。
    2. 您的權利：您有權在安全的工作環境中工作，雇主必須提供無騷擾的環境。
    3. 案例分享：某移工遭到同事不當肢體接觸，隨即通報管理員。該同事後續遭到懲處，公司亦提供移工心理支援。
    4. 申訴專線：若感到不適，請撥打113或連繫您的汎亞協調員。`
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Upcoming National Holiday Notice',
    title_zh: '國定假日放假通知',
    date: '2024-06-05',
    content: 'Dragon Boat Festival is approaching. Please follow the dormitory safety guidelines during the holiday.',
    content_zh: '端午節即將到來，連假期間請遵守宿舍安全準則。',
    category: 'Notice',
    category_zh: '公告'
  }
];

export const LIFESTYLE_SERVICES: LifeService[] = [
  {
    id: 'food',
    title: 'Food & Groceries',
    title_zh: '飲食與採買',
    icon: 'Utensils',
    category: 'Life',
    category_zh: '生活',
    items: [
      {
        name: 'Halal Food Mart',
        name_zh: '清真食品超市',
        desc: 'Sells various ingredients and spices from Southeast Asia.',
        desc_zh: '販售東南亞各類食材與香料。',
        location: 'https://maps.google.com'
      }
    ]
  }
];

export const MOCK_WORKER_DATABASE: User[] = [
  {
    passportNumber: 'F126155168',
    birthDate: '19831107',
    name: 'TEST USER PAN-ASIA',
    employer: 'supermicro',
    workerId: 'PA-83110-T',
    bloodType: 'B+',
    allergies: ['None'],
    passportExpiry: '2026-11-07',
    medicalCheckupDate: '2024-09-15',
    entryDate: '2024-01-15',
    entryType: 'abroad',
    dormitory: 'sm_bade',
    roomNumber: '101',
    readPromotions: [],
    points: 0,
    emergencyContact: { name: 'Emergency Support', relationship: 'Office', phone: '0800-000-000' },
    medicalHistory: [
      { id: '1', date: '2024-03-15', type: 'checkup', description: 'Initial Health Screening', description_zh: '初步健康篩檢' }
    ]
  }
];

export const NAV_ITEMS = (lang: 'en' | 'zh', isAdmin: boolean = false) => {
  const items = [
    { label: lang === 'en' ? 'Home' : '首頁', page: Page.DASHBOARD, icon: <LayoutDashboard size={20} /> },
    { label: lang === 'en' ? 'Themes' : '宣導', page: Page.PROMOTIONS, icon: <BookOpen size={20} /> },
    { label: lang === 'en' ? 'Health' : '健康', page: Page.MEDICAL_CARD, icon: <HeartPulse size={20} /> },
    { label: lang === 'en' ? 'Help' : '救援', page: Page.EMERGENCY, icon: <PhoneCall size={20} /> },
    { label: lang === 'en' ? 'AI' : 'AI 助手', page: Page.AI_ASSISTANT, icon: <MessageSquareQuote size={20} /> },
  ];
  if (isAdmin) {
    items.push({ label: lang === 'en' ? 'Admin' : '管理', page: Page.ADMIN, icon: <ShieldCheck size={20} /> });
  }
  return items;
};

export const TRANSLATIONS = {
  en: {
    login_title: "PAN-ASIA International",
    login_subtitle: "Worker Connect Portal",
    admin_title: "Admin Console",
    admin_subtitle: "Restricted Access Only",
    admin_user: "Admin Username",
    admin_pwd: "Admin Password",
    admin_btn: "AUTHORIZE",
    switch_to_admin: "Switch to Admin Mode",
    switch_to_worker: "Switch to Worker Login",
    passport: "Passport Number",
    dob: "Birth Date (YYYYMMDD)",
    login_err: "Invalid credentials.",
    welcome: "Welcome,",
    important_reminders: "Important Reminders",
    passport_expiry: "Passport Expiry",
    medical_due: "Statutory Medical Due",
    logout: "Logout",
    emergency: "Emergency Support",
    health_card: "Health Pass Card",
    login_btn: "LOGIN",
    ai_title: "PAN-ASIA AI",
    ai_subtitle: "24/7 SUPPORT",
    ask_anything: "Ask anything...",
    medical_pass: "PAN-ASIA Medical Pass",
    blood_type: "Blood Type",
    worker_id: "Worker ID",
    emergency_contact: "Emergency Contact",
    one_tap_help: "Quick Help",
    call_police: "Police (110)",
    call_ambulance: "Ambulance (119)",
    promotions: "Monthly Themes",
    mark_as_read: "I have read and understood",
    unread: "Unread",
    read_confirmed: "Read Confirmed",
    new_promotion: "New Safety Theme!",
    my_points: "My Rewards",
    points_unit: "Pts",
    points_earned: "Points Earned!",
    rewards_desc: "Points for future gift exchange!",
    login_bonus: "Monthly Login Bonus",
    reading_bonus: "Information Reading Bonus",
    admin_total_workers: "Total Workers",
    admin_active_rewards: "Active Rewards",
    admin_search_placeholder: "Search Name or Passport...",
    admin_all_employers: "All Employers",
    admin_worker_db: "Worker Database",
    admin_sys_name: "PAN-ASIA Systems",
    medical_history: "Medical History",
    add_record: "Add Record",
    save_record: "Save Record",
    health_id: "HEALTH ID",
    desc_label: "Description"
  },
  zh: {
    login_title: "汎亞國際",
    login_subtitle: "移工服務入口",
    admin_title: "管理者後台",
    admin_subtitle: "僅限授權人員進入",
    admin_user: "管理者帳號",
    admin_pwd: "管理者密碼",
    admin_btn: "授權進入",
    switch_to_admin: "切換至管理員模式",
    switch_to_worker: "切換至移工登入",
    passport: "護照號碼",
    dob: "出生年月日 (YYYYMMDD)",
    login_err: "帳號或密碼錯誤。",
    welcome: "您好，",
    important_reminders: "重要提醒事項",
    passport_expiry: "護照到期日",
    medical_due: "法定體檢到期日",
    logout: "登出",
    emergency: "緊急聯絡資訊",
    health_card: "傷病醫療卡",
    login_btn: "登入",
    ai_title: "汎亞 AI 助手",
    ai_subtitle: "24/7 線上服務",
    ask_anything: "請輸入您的問題...",
    medical_pass: "汎亞國際傷病醫療卡",
    blood_type: "血型",
    worker_id: "移工編號",
    emergency_contact: "緊急聯絡人",
    one_tap_help: "一鍵求助",
    call_police: "報警 (110)",
    call_ambulance: "救護車 (119)",
    promotions: "每月主題宣導",
    mark_as_read: "我已閱讀並理解以上內容",
    unread: "待閱讀",
    read_confirmed: "已確認閱覽",
    new_promotion: "新的宣導主題！",
    my_points: "我的積分",
    points_unit: "分",
    points_earned: "獲得積分！",
    rewards_desc: "積分可用於未來兌換獎品設施",
    login_bonus: "月度登入獎勵",
    reading_bonus: "資訊閱讀獎勵",
    admin_total_workers: "移工總數",
    admin_active_rewards: "累積發出積分",
    admin_search_placeholder: "搜尋姓名或護照號碼...",
    admin_all_employers: "所有雇主",
    admin_worker_db: "移工資料庫",
    admin_sys_name: "汎亞國際系統",
    medical_history: "就醫與體檢紀錄",
    add_record: "新增紀錄",
    save_record: "儲存紀錄",
    health_id: "醫療識別",
    desc_label: "描述內容"
  }
};
