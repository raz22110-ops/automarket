import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Car, Shield, DollarSign, ChevronRight, Menu, X, Star, Settings, Plus, Trash2, ArrowRight, Check, Calendar, Gauge, MessageCircle, Quote, Upload, User, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- חיבור למסד הנתונים Supabase ---
const mySupabaseUrl = 'https://pghsiondbznscjmmvijz.supabase.co';
const mySupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaHNpb25kYnpuc2NqbW12aWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTgxOTYsImV4cCI6MjA5MzM3NDE5Nn0.1XbCpdkU1_YflpvYtSJ-cZDdDotGTKbVESu_Cf7E9hA';
const supabase = createClient(mySupabaseUrl, mySupabaseKey);

const ISRAELI_CAR_MAKES = [
  "אאודי","אופל","אורא","איסוזו","אינפיניטי","איווקו","אלפא-רומיאו","אסטון מרטין",
  "במוו","בי-ווי-די (BYD)","גאקו","ג'יפ","ג'נסיס","גרייטוול","דאצ'יה","דודג'",
  "הונדה","יונדאי","וולוו","טויוטה","טסלה","יגואר","לאדה","לקסוס","מאזדה",
  "מזראטי","מיני","מיצובישי","מרצדס","ניסאן","סאנגיונג","סובארו","סוזוקי",
  "סיאט","סיטרואן","סמארט","סקודה","פולקסווגן","פורד","פורשה","פיאט","פיג'ו",
  "פרארי","צ'רי","קאדילק","קופרה","קיה","רנו","שברולט"
].sort();

const CarDealershipApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);
  
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [inventoryLoading, setInventoryLoading] = useState(true);

  const [tradeData, setTradeData] = useState({
    name: '', phone: '', make: '', model: '', year: '', engine: '', km: '', ownership: '', owners: ''
  });

  const handleTradeInSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('leads')
      .insert([{ 
        name: tradeData.name, 
        phone: tradeData.phone, 
        lead_type: 'טרייד-אין', 
        car_details: `${tradeData.make} ${tradeData.model} (${tradeData.year})` 
      }]);
    if (error) console.error('שגיאה בשמירת הליד:', error);

    const text = `שלום, אשמח לקבל הצעת טרייד-אין.\n\n*פרטי התקשרות:*\nשם: ${tradeData.name}\nטלפון: ${tradeData.phone}\n\n*פרטי הרכב שלי:*\nיצרן: ${tradeData.make}\nדגם: ${tradeData.model}\nשנתון: ${tradeData.year}\nסוג הנעה: ${tradeData.engine}\nקילומטראז': ${tradeData.km}\nבעלות מקורית: ${tradeData.ownership}\nיד: ${tradeData.owners}`;
    window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');
    setIsTradeInOpen(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === '159852') {
      setIsPasswordPromptOpen(false);
      setIsAdminOpen(true);
      setAdminPassword('');
      setPasswordError('');
    } else {
      setPasswordError('סיסמה שגויה, נסה שוב.');
    }
  };

  const [currentView, setCurrentView] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);

  const [searchTab, setSearchTab] = useState('finance');
  const [financePrice, setFinancePrice] = useState(150000);
  const [financeDownPayment, setFinanceDownPayment] = useState(30000);
  const [financePayments, setFinancePayments] = useState(60);
  const [financeCondition, setFinanceCondition] = useState('used');

  const [searchMake, setSearchMake] = useState('');
  const [searchCondition, setSearchCondition] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBudget, setSearchBudget] = useState(500000);

  const [searchResults, setSearchResults] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchSubtitle, setSearchSubtitle] = useState('');

  const calculateMonthly = () => {
    const principal = Math.max(0, financePrice - financeDownPayment);
    if (principal === 0) return 0;
    if (financePayments === 0) return principal;
    const annualRate = financeCondition === 'new' ? 0.045 : 0.061;
    const monthlyRate = annualRate / 12;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -financePayments));
    return Math.round(payment);
  };

  const handleFinanceSearch = () => {
    const maxMonthly = calculateMonthly();
    const results = inventory.filter(car => {
      if (!car.monthlyPayment) return false;
      const carMonthly = Number(car.monthlyPayment.toString().replace(/,/g, ''));
      return carMonthly <= maxMonthly;
    });
    setSearchResults(results);
    setSearchTitle('תוצאות חיפוש מימון');
    setSearchSubtitle(`נמצאו ${results.length} רכבים בהחזר חודשי משוער של עד ₪${maxMonthly.toLocaleString()}`);
    navigateTo('search');
  };

  const handleRegularSearch = () => {
    const results = inventory.filter(car => {
      let match = true;
      if (searchMake && car.make !== searchMake) match = false;
      if (searchCondition && car.condition !== searchCondition) match = false;
      if (searchCategory && car.type !== searchCategory) match = false;
      if (searchBudget) {
        const carPrice = Number(car.price.toString().replace(/,/g, ''));
        if (carPrice > searchBudget) match = false;
      }
      return match;
    });
    setSearchResults(results);
    setSearchTitle('תוצאות חיפוש');
    setSearchSubtitle(`נמצאו ${results.length} רכבים התואמים להעדפות ולתקציב שלך.`);
    navigateTo('search');
  };

  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error("Error fetching from Supabase:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const [newCar, setNewCar] = useState({
    make: '', model: '', subModel: '', year: '', condition: 'משומש', engineType: 'בנזין',
    mileage: '', owners: '', engineCapacity: '', price: '', monthlyPayment: '',
    listPrice: '', showListPrice: false, images: [], type: 'משפחתי'
  });

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 720;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 10) { alert('ניתן להעלות עד 10 תמונות לכל רכב.'); return; }
    try {
      const promises = files.map(file => resizeImage(file));
      const base64Images = await Promise.all(promises);
      setNewCar({ ...newCar, images: base64Images });
    } catch (err) {
      alert('שגיאה בעיבוד התמונות.');
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const mainImage = newCar.images && newCar.images.length > 0 ? newCar.images[0] : '';
    const carToAdd = {
      ...newCar,
      id: Date.now().toString(),
      image: mainImage,
      images: newCar.images || [],
      createdAt: Date.now()
    };
    try {
      const { error } = await supabase.from('inventory').insert([carToAdd]);
      if (error) throw error;
      setInventory([carToAdd, ...inventory]);
      setNewCar({ make: '', model: '', subModel: '', year: '', condition: 'משומש', engineType: 'בנזין', mileage: '', owners: '', engineCapacity: '', price: '', monthlyPayment: '', listPrice: '', showListPrice: false, images: [], type: 'משפחתי' });
    } catch (error) {
      console.error("שגיאה בהעלאה:", error);
      alert('שגיאה בשמירת הרכב למסד הנתונים.');
    }
  };

  const handleDeleteCar = async (id) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
      setInventory(inventory.filter(car => car.id !== id));
    } catch (error) {
      console.error("Error deleting car: ", error);
      alert("שגיאה במחיקת הרכב.");
    }
  };

  const navigateTo = (view, hash = null) => {
    setCurrentView(view);
    setSelectedCar(null);
    setIsMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleViewCarDetails = (car) => {
    setSelectedCar(car);
    window.scrollTo(0, 0);
  };

  const testimonials = [
    { id: 1, name: 'יוסי אהרוני', text: 'שירות מעל ומעבר! קניתי מרצדס והרגשתי לאורך כל הדרך שדואגים לי באמת. שקיפות מלאה וטיפול אישי. ממליץ בחום.', car: 'קנה: Mercedes S-Class' },
    { id: 2, name: 'מיכל לוי', text: 'חיפשתי רכב פנאי למשפחה ועזרו לי למצוא בדיוק את מה שהייתי צריכה. עשו לי טרייד אין הוגן על הרכב הישן שלי. אלופים.', car: 'קנתה: Range Rover Sport' },
    { id: 3, name: 'דניאל כהן', text: 'סוכנות ברמה אירופאית. רכבים מדהימים ותנאי מימון שאי אפשר למצוא במקומות אחרים. חווית קנייה חלקה ומהירה.', car: 'קנה: Porsche 911' }
  ];

  const CarGrid = ({ cars }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {inventoryLoading ? (
        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-neutral-400 font-medium">טוען מלאי מהענן...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="col-span-full py-20 text-center">
          <Car className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">לא נמצאו רכבים</h3>
          <p className="text-neutral-400">כרגע אין רכבים בקטגוריה זו במלאי.</p>
        </div>
      ) : (
        cars.map(car => (
          <div key={car.id} className="group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-600/50 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-neutral-800 flex items-center justify-center">
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium border border-white/10">{car.type}</div>
              <div className={`absolute top-4 left-4 z-10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold border ${car.condition === 'חדש' ? 'bg-red-600/90 text-white border-red-500' : 'bg-neutral-600/80 text-white border-neutral-500'}`}>{car.condition}</div>
              <img src={car.image || '/back.jpg'} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = '/back.jpg' }} />
            </div>
            <div className="p-4 md:p-6 text-right">
              <div className="flex justify-between items-start mb-4 flex-row-reverse">
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white mb-1">{car.make} {car.model}</h3>
                  <p className="text-neutral-400 text-sm">{car.year} | {car.subModel}</p>
                </div>
                <div className="text-left flex flex-col items-start">
                  {car.showListPrice && car.listPrice && (
                    <span className="text-neutral-500 line-through text-sm font-medium">מחירון: ₪ {car.listPrice}</span>
                  )}
                  <p className="text-lg font-bold text-red-600">₪ {car.price}</p>
                  {car.monthlyPayment && <p className="text-xs text-neutral-400 font-medium mt-1">החל מ- ₪ {car.monthlyPayment} לחודש</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-end gap-2 text-sm text-neutral-300">{car.mileage} ק"מ<Gauge className="w-4 h-4 text-neutral-500" /></div>
                <div className="flex items-center justify-end gap-2 text-sm text-neutral-300">יד {car.owners}<User className="w-4 h-4 text-neutral-500" /></div>
                <div className="flex items-center justify-end gap-2 text-sm text-neutral-300">{car.engineCapacity} סמ"ק<Settings className="w-4 h-4 text-neutral-500" /></div>
                <div className="flex items-center justify-end gap-2 text-sm text-neutral-300">{car.engineType}<Zap className="w-4 h-4 text-neutral-500" /></div>
              </div>
              <button onClick={() => handleViewCarDetails(car)} className="w-full bg-neutral-800 hover:bg-red-600 hover:text-white text-white py-3 rounded-xl font-bold transition-colors">לפרטים נוספים</button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const GenericInventoryPage = ({ cars, title, subtitle }) => (
    <div className="pt-32 pb-24 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-neutral-800 pb-8 text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-neutral-400">{subtitle}</p>
        </div>
        <CarGrid cars={cars} />
      </div>
    </div>
  );

  const CarDetailsPage = ({ car, onBack }) => {
    const [leadName, setLeadName] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [wantFinance, setWantFinance] = useState(false);
    const [haveTradeIn, setHaveTradeIn] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const handleLeadSubmit = async (e) => {
      e.preventDefault();
      let typeOfLead = 'התעניינות ברכב';
      if (wantFinance) typeOfLead = 'מימון';
      if (haveTradeIn) typeOfLead = 'טרייד-אין';
      const { error } = await supabase.from('leads').insert([{ name: leadName, phone: leadPhone, lead_type: typeOfLead, car_details: `${car.make} ${car.model} (${car.year})` }]);
      if (error) console.error('שגיאה בשמירת הליד:', error);
      const text = `שלום, אני מתעניין ברכב ${car.make} ${car.model} (${car.year}) שמופיע באתר.\n\n*פרטי קשר:*\nשם: ${leadName}\nטלפון: ${leadPhone}\nמעוניין במימון: ${wantFinance ? 'כן' : 'לא'}\nיש רכב לטרייד-אין: ${haveTradeIn ? 'כן' : 'לא'}`;
      window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="pt-32 pb-16 bg-neutral-950 min-h-screen text-right" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors mb-8 font-medium bg-neutral-900/50 px-4 py-2 rounded-full w-fit border border-neutral-800 mr-0 ml-auto">
            חזרה למלאי <ArrowRight className="w-5 h-5" />
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 h-[300px] md:h-[500px] relative">
                <div className={`absolute top-6 right-6 z-10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border ${car.condition === 'חדש' ? 'bg-red-600/90 text-white border-red-500' : 'bg-neutral-600/80 text-white border-neutral-500'}`}>{car.condition}</div>
                <img src={(car.images && car.images.length > 0) ? car.images[activeImageIndex] : (car.image || '/back.jpg')} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover transition-all duration-300" onError={(e) => { e.target.src = '/back.jpg' }} />
              </div>
              {car.images && car.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 flex-row-reverse">
                  {car.images.map((img, idx) => (
                    <div key={idx} onClick={() => setActiveImageIndex(idx)} className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-red-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-center"><Calendar className="w-8 h-8 text-red-600 mx-auto mb-3" /><p className="text-neutral-400 text-sm mb-1">שנת ייצור</p><p className="text-white font-bold text-lg">{car.year}</p></div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-center"><Settings className="w-8 h-8 text-red-600 mx-auto mb-3" /><p className="text-neutral-400 text-sm mb-1">סוג הנעה</p><p className="text-white font-bold text-lg">{car.engineType}</p></div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-center"><Gauge className="w-8 h-8 text-red-600 mx-auto mb-3" /><p className="text-neutral-400 text-sm mb-1">קילומטראז'</p><p className="text-white font-bold text-lg" dir="ltr">{car.mileage} km</p></div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-center"><Car className="w-8 h-8 text-red-600 mx-auto mb-3" /><p className="text-neutral-400 text-sm mb-1">קטגוריה</p><p className="text-white font-bold text-lg">{car.type}</p></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-neutral-900 p-4 rounded-2xl border border-neutral-800 text-center"><p className="text-neutral-400 text-sm mb-1">יד הרכב</p><p className="text-white font-bold text-lg">{car.owners}</p></div>
                <div className="flex-1 bg-neutral-900 p-4 rounded-2xl border border-neutral-800 text-center"><p className="text-neutral-400 text-sm mb-1">נפח מנוע (סמ"ק)</p><p className="text-white font-bold text-lg">{car.engineCapacity}</p></div>
              </div>
              <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
                <h3 className="text-2xl font-bold text-white mb-6 text-right">למה לקנות את הרכב הזה באוטו מרקט?</h3>
                <ul className="space-y-4 text-right">
                  {["אחריות מקיפה על הרכב, מנוע וגיר לשקט הנפשי שלך.","אפשרות ל-100% מימון בתנאים המשתלמים ביותר בשוק.","אפשרות לטרייד-אין עתידי בהתחייבות.","רכב שעבר בדיקה קפדנית והכנה מלאה לפני מסירה."].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 flex-row-reverse">
                      <div className="mt-1 bg-red-600/20 p-1 rounded-full"><Check className="w-4 h-4 text-red-500" /></div>
                      <span className="text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-full -z-0"></div>
                <div className="relative z-10 text-right">
                  <h1 className="text-3xl font-bold text-white mb-2">{car.make} <span className="text-2xl font-normal text-neutral-300">{car.model}</span></h1>
                  <h2 className="text-lg text-neutral-400 mb-6">{car.subModel}</h2>
                  <div className="border-t border-neutral-800 pt-6">
                    {car.showListPrice && car.listPrice && (
                      <div className="mb-1"><span className="text-neutral-500 text-sm">מחיר מחירון: </span><span className="text-neutral-500 line-through font-medium">₪ {car.listPrice}</span></div>
                    )}
                    <div className="flex flex-col gap-2">
                      <span className="text-4xl font-bold text-red-600">₪ {car.price}</span>
                      {car.monthlyPayment && <span className="text-sm font-medium text-neutral-400">החזר חודשי החל מ- ₪ {car.monthlyPayment}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900 p-8 rounded-2xl border border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <h3 className="text-2xl font-bold text-white mb-2 text-right">אני מעוניין ברכב</h3>
                <p className="text-neutral-400 text-sm mb-6 text-right">השאר פרטים ונציג שלנו יחזור אליך בהקדם.</p>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="שם מלא" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 focus:outline-none text-right" required />
                  <input type="tel" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="מספר טלפון" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 focus:outline-none text-right" required />
                  <div className="flex items-center justify-end gap-2 mb-2 flex-row-reverse">
                    <input type="checkbox" id="finance" checked={wantFinance} onChange={e => setWantFinance(e.target.checked)} className="accent-red-600 w-4 h-4" />
                    <label htmlFor="finance" className="text-sm text-neutral-300 cursor-pointer">מעוניין במימון</label>
                  </div>
                  <div className="flex items-center justify-end gap-2 mb-4 flex-row-reverse">
                    <input type="checkbox" id="tradein" checked={haveTradeIn} onChange={e => setHaveTradeIn(e.target.checked)} className="accent-red-600 w-4 h-4" />
                    <label htmlFor="tradein" className="text-sm text-neutral-300 cursor-pointer">יש לי רכב לטרייד-אין</label>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg flex items-center justify-center gap-2 flex-row-reverse">
                    שלח בוואטסאפ <MessageCircle className="w-5 h-5" />
                  </button>
                  <div className="mt-4 text-center">
                    <span className="text-neutral-500 text-sm">או התקשר עכשיו:</span>
                    <a href="tel:052-644-1855" className="block text-red-500 font-bold text-lg mt-1 dir-ltr">052-644-1855</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans" dir="rtl">

      {/* ============================================================
          נאב-בר — תוקן למובייל: לוגו קטן יותר, גובה מופחת
          ============================================================ */}
      <nav className="fixed w-full z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            {/* שינוי: h-16 במובייל (היה h-20 קבוע), לוגו h-10 במובייל */}
            <button onClick={() => navigateTo('home')} className="flex items-center cursor-pointer bg-transparent border-none p-0">
              <img src="/logo.png" alt="אוטו מרקט לוגו" className="h-10 md:h-16 w-auto object-contain" />
            </button>
            
            <div className="hidden lg:flex space-x-8 space-x-reverse items-center">
              <button onClick={() => navigateTo('home')} className={`font-medium transition-colors ${currentView === 'home' && !selectedCar ? 'text-red-500' : 'text-neutral-300 hover:text-red-500'}`}>ראשי</button>
              <button onClick={() => navigateTo('new')} className={`font-medium transition-colors ${currentView === 'new' && !selectedCar ? 'text-red-500' : 'text-neutral-300 hover:text-red-500'}`}>רכבים חדשים</button>
              <button onClick={() => navigateTo('used')} className={`font-medium transition-colors ${currentView === 'used' && !selectedCar ? 'text-red-500' : 'text-neutral-300 hover:text-red-500'}`}>רכבים משומשים</button>
              <button onClick={() => navigateTo('home', 'about')} className="font-medium text-neutral-300 hover:text-red-500 transition-colors">אודותינו</button>
              <button onClick={() => setIsTradeInOpen(true)} className="text-red-500 font-bold hover:text-red-400 transition-colors mr-4">הצעת טרייד אין</button>
              <button onClick={() => navigateTo('home', 'contact')} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-500 transition-colors">צור קשר</button>
            </div>

            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-neutral-300 hover:text-white">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-b border-neutral-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => navigateTo('home')} className="block w-full text-right px-3 py-3 text-neutral-300 hover:text-red-500 border-b border-neutral-800">ראשי</button>
              <button onClick={() => navigateTo('new')} className="block w-full text-right px-3 py-3 text-neutral-300 hover:text-red-500 border-b border-neutral-800">רכבים חדשים</button>
              <button onClick={() => navigateTo('used')} className="block w-full text-right px-3 py-3 text-neutral-300 hover:text-red-500 border-b border-neutral-800">רכבים משומשים</button>
              <button onClick={() => navigateTo('home', 'about')} className="block w-full text-right px-3 py-3 text-neutral-300 hover:text-red-500 border-b border-neutral-800">אודותינו</button>
              <button onClick={() => { setIsTradeInOpen(true); setIsMenuOpen(false); }} className="block w-full text-right px-3 py-3 text-red-500 font-bold border-b border-neutral-800">הצעת טרייד אין</button>
              <button onClick={() => navigateTo('home', 'contact')} className="block w-full text-center mt-4 px-3 py-3 bg-red-600 text-white font-bold rounded-full">צור קשר</button>
            </div>
          </div>
        )}
      </nav>

      {selectedCar ? (
        <CarDetailsPage car={selectedCar} onBack={() => setSelectedCar(null)} />
      ) : currentView === 'new' ? (
        <GenericInventoryPage cars={inventory.filter(car => car.condition === 'חדש')} title={<>מלאי <span className="text-red-600">רכבים חדשים</span></>} subtitle={`מציג ${inventory.filter(car => car.condition === 'חדש').length} רכבים מתוך המלאי שלנו. כל רכב עבר בדיקה קפדנית.`} />
      ) : currentView === 'used' ? (
        <GenericInventoryPage cars={inventory.filter(car => car.condition === 'משומש')} title={<>מלאי <span className="text-red-600">רכבים משומשים</span></>} subtitle={`מציג ${inventory.filter(car => car.condition === 'משומש').length} רכבים מתוך המלאי שלנו. כל רכב עבר בדיקה קפדנית.`} />
      ) : currentView === 'search' ? (
        <GenericInventoryPage cars={searchResults} title={<span className="text-red-600">{searchTitle}</span>} subtitle={searchSubtitle} />
      ) : (
        <>
          {/* ============================================================
              HERO — תוקן: הסרת scale-105, padding מותאם למובייל
              ============================================================ */}
          <div className="relative pt-16 md:pt-20 pb-16 md:pb-20 min-h-[90vh] flex items-center justify-center">
            <div className="absolute inset-0 z-0">
              <img src="/back.jpg" alt="Luxury Car" className="w-full h-full object-cover opacity-40" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
            </div>
            
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10 md:mt-20 w-full">
              <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 text-white drop-shadow-lg">
                המסע שלך לרכב הבא <br/><span className="text-red-600">מתחיל כאן.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-300 mb-8 md:mb-10 max-w-2xl mx-auto">
                אוטו מרקט מתמחה בכל סוגי הרכבים - מחדשים ועד משומשים. אנו מציעים חווית קנייה יוצאת דופן עם פתרונות מימון וטרייד-אין מותאמים אישית.
              </p>
              
              {/* ============================================================
                  סימולטור — תוקן: הסרת scale-105, overflow-x-hidden,
                  padding קטן יותר במובייל, גריד מסתגל
                  ============================================================ */}
              <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden mt-6 md:mt-8 text-right w-full">
                <div className="flex border-b border-neutral-800 flex-row-reverse">
                  <button onClick={() => setSearchTab('finance')} className={`flex-1 py-3 md:py-4 text-sm md:text-base font-bold transition-colors ${searchTab === 'finance' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}>סימולטור מימון</button>
                  <button onClick={() => setSearchTab('regular')} className={`flex-1 py-3 md:py-4 text-sm md:text-base font-bold transition-colors ${searchTab === 'regular' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}>חיפוש רכב</button>
                </div>

                <div className="p-4 md:p-6 text-right">
                  {searchTab === 'regular' && (
                    <div className="space-y-4 md:space-y-6 text-right">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <select value={searchMake} onChange={e => setSearchMake(e.target.value)} className="bg-neutral-800 text-white rounded-xl px-4 py-3 border border-neutral-700 focus:outline-none focus:border-red-600 text-right appearance-none font-medium">
                          <option value="">כל היצרנים</option>
                          {ISRAELI_CAR_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                        </select>
                        <select value={searchCondition} onChange={e => setSearchCondition(e.target.value)} className="bg-neutral-800 text-white rounded-xl px-4 py-3 border border-neutral-700 focus:outline-none focus:border-red-600 text-right appearance-none font-medium">
                          <option value="">כל המצבים</option>
                          <option value="חדש">רכב חדש</option>
                          <option value="משומש">רכב משומש</option>
                        </select>
                        <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} className="bg-neutral-800 text-white rounded-xl px-4 py-3 border border-neutral-700 focus:outline-none focus:border-red-600 text-right appearance-none font-medium">
                          <option value="">כל הקטגוריות</option>
                          <option value="משפחתי">משפחתי</option>
                          <option value="יוקרה">יוקרה</option>
                          <option value="ספורט">ספורט</option>
                          <option value="SUV">SUV</option>
                        </select>
                      </div>
                      <div className="bg-neutral-950 p-4 md:p-6 rounded-2xl border border-neutral-800">
                        <div className="flex justify-between text-sm mb-4 items-end flex-row-reverse">
                          <span className="text-neutral-400 font-medium">תקציב מקסימלי</span>
                          <span className="text-white font-bold text-xl md:text-2xl">עד ₪ {searchBudget.toLocaleString()}</span>
                        </div>
                        <input type="range" min="10000" max="1500000" step="10000" value={searchBudget} onChange={(e) => setSearchBudget(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                      </div>
                      <button onClick={handleRegularSearch} className="w-full bg-red-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-colors text-lg shadow-lg shadow-red-600/20 flex-row-reverse">
                        חפש רכבים <Search className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {searchTab === 'finance' && (
                    /* מובייל: עמודה אחת לגמרי. דסקטופ: גריד 3 עמודות */
                    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center text-right">

                      {/* סליידרים — תופסים 2/3 בדסקטופ */}
                      <div className="w-full lg:col-span-2 flex flex-col gap-4">
                        {/* בחירת סוג רכב */}
                        <div className="flex flex-row-reverse gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                          <button
                            onClick={() => setFinanceCondition('new')}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${financeCondition === 'new' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                          >חדש (4.5%)</button>
                          <button
                            onClick={() => setFinanceCondition('used')}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${financeCondition === 'used' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                          >משומש (6.1%)</button>
                        </div>

                        {/* שווי הרכב */}
                        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                          <div className="flex justify-between items-center mb-3 flex-row-reverse">
                            <span className="text-neutral-400 text-sm font-medium">שווי הרכב</span>
                            <span className="text-white font-bold text-xl">₪ {financePrice.toLocaleString()}</span>
                          </div>
                          <input type="range" min="10000" max="800000" step="5000" value={financePrice}
                            onChange={(e) => setFinancePrice(Number(e.target.value))}
                            className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                        </div>

                        {/* מקדמה */}
                        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                          <div className="flex justify-between items-center mb-3 flex-row-reverse">
                            <span className="text-neutral-400 text-sm font-medium">מקדמה</span>
                            <span className="text-white font-bold text-xl">₪ {financeDownPayment.toLocaleString()}</span>
                          </div>
                          <input type="range" min="0" max="250000" step="5000" value={financeDownPayment}
                            onChange={(e) => setFinanceDownPayment(Number(e.target.value))}
                            className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                        </div>

                        {/* מספר תשלומים */}
                        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                          <div className="flex justify-between items-center mb-3 flex-row-reverse">
                            <span className="text-neutral-400 text-sm font-medium">מספר תשלומים</span>
                            <span className="text-white font-bold text-xl">{financePayments} חודשים</span>
                          </div>
                          <input type="range" min="12" max="100" step="1" value={financePayments}
                            onChange={(e) => setFinancePayments(Number(e.target.value))}
                            className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                        </div>
                      </div>

                      {/* תוצאה — מתחת בכל רוחב המסך במובייל */}
                      <div className="w-full bg-neutral-950 p-6 rounded-2xl border border-red-600/40 flex flex-col items-center text-center shadow-[0_0_25px_rgba(220,38,38,0.12)]">
                        <span className="text-neutral-400 text-sm font-medium mb-1">החזר חודשי משוער</span>
                        <span className="text-5xl font-black text-red-600 my-3">₪ {calculateMonthly().toLocaleString()}</span>
                        <span className="text-xs text-neutral-500 mb-5 leading-relaxed">*החישוב משוער וכפוף לאישור הגוף המממן. ט.ל.ח</span>
                        <button
                          onClick={handleFinanceSearch}
                          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 flex-row-reverse"
                        >
                          מצא רכב בתקציב זה <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* שאר הסקשנים — ללא שינוי */}
          <section id="inventory-new" className="py-24 bg-neutral-950 relative border-b border-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12 flex-row-reverse">
                <div className="text-right w-full md:w-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-right">רכבים <span className="text-red-600">חדשים</span></h2>
                  <p className="text-neutral-400 text-right">מבחר הרכבים החדשים (0 ק"מ) באולם התצוגה שלנו.</p>
                </div>
                <button onClick={() => navigateTo('new')} className="hidden md:flex items-center text-red-600 hover:text-red-500 font-semibold gap-1 flex-row-reverse whitespace-nowrap">
                  צפה בכל המלאי ({inventory.filter(car => car.condition === 'חדש').length}) <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <CarGrid cars={inventory.filter(car => car.condition === 'חדש').slice(0, 6)} />
              <div className="mt-8 text-center md:hidden">
                <button onClick={() => navigateTo('new')} className="text-red-600 font-semibold flex items-center justify-center gap-1 mx-auto flex-row-reverse">
                  צפה בכל המלאי ({inventory.filter(car => car.condition === 'חדש').length}) <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </section>

          <section id="inventory-used" className="py-24 bg-neutral-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12 flex-row-reverse">
                <div className="text-right w-full md:w-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-right">רכבים <span className="text-red-600">משומשים</span></h2>
                  <p className="text-neutral-400 text-right">מבחר רכבי היד שנייה המעולים שלנו, לאחר בדיקה קפדנית.</p>
                </div>
                <button onClick={() => navigateTo('used')} className="hidden md:flex items-center text-red-600 hover:text-red-500 font-semibold gap-1 flex-row-reverse whitespace-nowrap">
                  צפה בכל המלאי ({inventory.filter(car => car.condition === 'משומש').length}) <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <CarGrid cars={inventory.filter(car => car.condition === 'משומש').slice(0, 6)} />
              <div className="mt-8 text-center md:hidden">
                <button onClick={() => navigateTo('used')} className="text-red-600 font-semibold flex items-center justify-center gap-1 mx-auto flex-row-reverse">
                  צפה בכל המלאי ({inventory.filter(car => car.condition === 'משומש').length}) <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </section>

          <section id="services" className="py-24 bg-neutral-900 border-y border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">המעטפת <span className="text-red-600">המושלמת</span></h2>
                <p className="text-neutral-400 max-w-2xl mx-auto">אוטו מרקט מספקת חווית רכישה מלאה, החל ממציאת הרכב המושלם ועד לפתרונות מימון וטרייד-אין נוחים.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: <DollarSign className="w-8 h-8" />, title: 'פתרונות מימון', text: 'אפשרויות מימון גמישות עד 100% ופריסת תשלומים נוחה מול הגופים המובילים.' },
                  { icon: <Car className="w-8 h-8" />, title: 'טרייד אין הוגן', text: 'החלף את הרכב הישן בחדש או משומש בתנאים מועדפים, שקיפות מלאה ומחירון הוגן.' },
                  { icon: <Shield className="w-8 h-8" />, title: 'אחריות ובדיקה', text: 'כל רכב עובר בדיקות מקיפות ונמסר עם שקיפות מלאה לגבי מצבו לשקט הנפשי שלך.' }
                ].map((s, i) => (
                  <div key={i} className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-700 text-red-600">{s.icon}</div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-neutral-400">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="py-24 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row gap-12 items-center flex-row-reverse">
                <div className="md:w-1/2 text-right">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">למה לבחור <span className="text-red-600">באוטו מרקט?</span></h2>
                  <p className="text-neutral-300 text-lg mb-6 leading-relaxed">באוטו מרקט, אנחנו מאמינים שקניית רכב צריכה להיות חוויה מרגשת, בטוחה ונטולת דאגות. עם שנים של ניסיון בענף הרכב, בנינו סוכנות ששמה את הלקוח במרכז, עם דגש על שקיפות מוחלטת, מקצועיות ושירות VIP.</p>
                  <ul className="space-y-4 mb-8">
                    {[
                      { b: 'מבחר מוקפד:', t: 'כל רכב באולם התצוגה שלנו נבחר בקפידה ועובר סדרת בדיקות קפדניות.' },
                      { b: 'שקיפות מלאה:', t: 'אנחנו מציגים בפניך את כל ההיסטוריה של הרכב, ללא הפתעות.' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 flex-row-reverse text-right">
                        <div className="mt-1 bg-red-600/20 p-1 rounded-full shrink-0"><Check className="w-4 h-4 text-red-500" /></div>
                        <span className="text-neutral-300"><strong>{item.b}</strong> {item.t}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigateTo('home', 'contact')} className="bg-transparent border-2 border-red-600 text-red-500 px-8 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors">דברו איתנו</button>
                </div>
                <div className="md:w-1/2 relative">
                  <div className="absolute inset-0 bg-red-600/20 rounded-3xl blur-2xl transform -skew-y-6"></div>
                  <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000" alt="אולם תצוגה אוטו מרקט" className="relative z-10 rounded-3xl shadow-2xl border border-neutral-800" />
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">מצאת את רכב החלומות שלך?</h2>
              <p className="text-neutral-100 text-xl mb-10 font-medium">השאר פרטים ונציג אישי יחזור אליך תוך דקות ספורות להצעת מחיר משתלמת.</p>
              <form className="flex flex-col md:flex-row gap-4 justify-center flex-row-reverse"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const name = e.target.elements[0].value;
                  const phone = e.target.elements[1].value;
                  const { error } = await supabase.from('leads').insert([{ name, phone, lead_type: 'פנייה כללית', car_details: 'אין' }]);
                  if (error) console.error('שגיאה בשמירת הליד:', error);
                  const text = `שלום, הגעתי מהאתר (עמוד ראשי) ואשמח שיחזרו אליי.\nשם: ${name}\nטלפון: ${phone}`;
                  window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <input type="text" placeholder="שם מלא" className="px-6 py-4 rounded-xl bg-white/90 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 w-full md:w-auto text-right" required />
                <input type="tel" placeholder="מספר טלפון" className="px-6 py-4 rounded-xl bg-white/90 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950 w-full md:w-auto text-right" required />
                <button type="submit" className="px-8 py-4 bg-neutral-950 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 flex-row-reverse">
                  שלח בוואטסאפ <MessageCircle className="w-5 h-5" />
                </button>
              </form>
            </div>
          </section>

          <section className="py-24 bg-neutral-900 border-y border-neutral-800 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">לקוחות <span className="text-red-600">ממליצים</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 relative text-right">
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-red-600/20" />
                    <div className="flex gap-1 mb-4 flex-row-reverse">
                      {[1,2,3,4,5].map((star) => <Star key={star} className="w-4 h-4 fill-red-500 text-red-500" />)}
                    </div>
                    <p className="text-neutral-300 mb-6 text-lg relative z-10 leading-relaxed">"{testimonial.text}"</p>
                    <div className="border-t border-neutral-800 pt-4 mt-auto">
                      <p className="font-bold text-white text-lg">{testimonial.name}</p>
                      <p className="text-red-500 text-sm">{testimonial.car}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <footer id="contact" className="bg-neutral-950 pt-24 pb-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <img src="/logo.png" alt="אוטו מרקט לוגו" className="h-16 md:h-20 w-auto object-contain mb-6" />
            <p className="text-neutral-400 max-w-2xl text-lg">סוכנות הרכב המובילה בישראל לכל סוגי הרכבים. חווית רכישה, שירות, מימון וטרייד-אין תחת קורת גג אחת בסטנדרט שטרם הכרתם.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-t border-neutral-800/50 pt-16">
            <div className="text-right">
              <h4 className="text-white font-bold mb-8 text-xl">יצירת קשר</h4>
              <ul className="space-y-6 text-neutral-400">
                <li className="flex items-center gap-4 flex-row-reverse">
                  <div className="bg-neutral-900 p-3 rounded-xl text-red-600 shadow-inner"><Phone className="w-5 h-5" /></div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-neutral-500">טלפון לשירות לקוחות</span>
                    <a href="tel:052-644-1855" className="text-white font-bold text-lg hover:text-red-500 transition-colors" dir="ltr">052-644-1855</a>
                  </div>
                </li>
                <li className="flex items-center gap-4 flex-row-reverse">
                  <div className="bg-neutral-900 p-3 rounded-xl text-red-600 shadow-inner"><MapPin className="w-5 h-5" /></div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-neutral-500">אולם תצוגה</span>
                    <span className="text-white font-bold">פרנץ אופנהיימר 2, נתניה</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="text-right md:text-center flex flex-col items-end md:items-center">
              <h4 className="text-white font-bold mb-8 text-xl">ניווט מהיר</h4>
              <ul className="space-y-4 text-neutral-400 inline-block text-right">
                {[
                  { label: 'מלאי רכבים חדשים', action: () => navigateTo('new') },
                  { label: 'רכבי יד שנייה', action: () => navigateTo('used') },
                  { label: 'טופס הצעת טרייד-אין', action: () => setIsTradeInOpen(true) },
                  { label: 'אודות הסוכנות', action: () => navigateTo('home', 'about') }
                ].map((item, i) => (
                  <li key={i}><button onClick={item.action} className="hover:text-red-600 transition-colors flex items-center gap-2 flex-row-reverse"><ChevronRight className="w-4 h-4 text-red-600 rotate-180" /> {item.label}</button></li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <h4 className="text-white font-bold mb-8 text-xl">שעות פעילות</h4>
              <ul className="space-y-3 text-neutral-400 mb-8">
                {[
                  { day: "א' - ה'", hours: '09:00 - 18:00' },
                  { day: 'שישי', hours: '09:00 - 13:00' },
                  { day: 'שבת', hours: null }
                ].map((s, i) => (
                  <li key={i} className="flex justify-between items-center border-b border-neutral-800/50 pb-2 flex-row-reverse">
                    <span className="text-white">{s.day}</span>
                    {s.hours ? <span className="font-medium">{s.hours}</span> : <span className="text-red-500 font-medium">סגור</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 flex-row-reverse">
            <p className="text-sm text-neutral-500">© {new Date().getFullYear()} Auto Market. כל הזכויות שמורות.</p>
            <div className="flex gap-6 text-sm text-neutral-500 flex-row-reverse">
              <a href="#" className="hover:text-white transition-colors">תקנון האתר</a>
              <a href="#" className="hover:text-white transition-colors">הצהרת נגישות</a>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/972526441855?text=שלום,%20הגעתי%20מהאתר%20ואני%20מעוניין%20בפרטים%20על%20רכב" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all z-40">
        <MessageCircle className="w-8 h-8" />
      </a>

      <button onClick={() => setIsPasswordPromptOpen(true)} className="fixed bottom-6 left-6 bg-neutral-800 text-neutral-400 p-3 rounded-full hover:bg-neutral-700 hover:text-white transition-colors z-40">
        <Settings className="w-5 h-5" />
      </button>

      {isPasswordPromptOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 text-right relative shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <button onClick={() => { setIsPasswordPromptOpen(false); setPasswordError(''); setAdminPassword(''); }} className="absolute top-4 left-4 text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-2">כניסה לניהול מלאי</h3>
            <p className="text-neutral-400 text-sm mb-6">הזן סיסמת מנהל כדי להמשיך</p>
            <form onSubmit={handlePasswordSubmit}>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="סיסמה" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right mb-4" autoFocus />
              {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">כניסה למערכת</button>
            </form>
          </div>
        </div>
      )}

      {isTradeInOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(220,38,38,0.1)] relative">
            <button onClick={() => setIsTradeInOpen(false)} className="absolute top-4 left-4 text-neutral-400 hover:text-white z-20 bg-neutral-800 hover:bg-red-600 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            <div className="bg-neutral-900 p-6 md:p-8 text-center border-b border-neutral-800 shrink-0">
              <h2 className="text-3xl font-bold text-white mb-2">הצעת טרייד אין <span className="text-red-600">מהירה</span></h2>
              <p className="text-neutral-400 text-sm">מלאו את פרטי הרכב שלכם וקבלו הצעת מחיר אטרקטיבית לשדרוג הרכב.</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              <form onSubmit={handleTradeInSubmit} className="space-y-6 text-sm text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                  {[
                    { label: 'שם מלא', key: 'name', type: 'text', placeholder: "לדוג': ישראל ישראלי" },
                    { label: 'מספר טלפון', key: 'phone', type: 'tel', placeholder: "לדוג': 052-1234567" },
                    { label: 'יצרן', key: 'make', type: 'text', placeholder: "לדוג': יונדאי" },
                    { label: 'תת דגם', key: 'model', type: 'text', placeholder: "לדוג': טוסון Elite" },
                    { label: 'שנתון', key: 'year', type: 'number', placeholder: "לדוג': 2021" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-neutral-400 mb-1">{f.label}</label>
                      <input type={f.type} value={tradeData[f.key]} onChange={e => setTradeData({...tradeData, [f.key]: e.target.value})} placeholder={f.placeholder} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right" required />
                    </div>
                  ))}
                  <div>
                    <label className="block text-neutral-400 mb-1">סוג הנעה</label>
                    <select value={tradeData.engine} onChange={e => setTradeData({...tradeData, engine: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right" required>
                      <option value="" disabled>בחר סוג הנעה</option>
                      {['בנזין','הייבריד','חשמלי','דיזל','פלאג אין הייבריד'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">קילומטר</label>
                    <input type="number" value={tradeData.km} onChange={e => setTradeData({...tradeData, km: e.target.value})} placeholder="לדוג': 45000" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right" required />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">בעלות מקורית</label>
                    <select value={tradeData.ownership} onChange={e => setTradeData({...tradeData, ownership: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right" required>
                      <option value="" disabled>בחר בעלות</option>
                      {['פרטית','ליסינג','השכרה','חברה'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">יד הרכב</label>
                    <input type="number" value={tradeData.owners} onChange={e => setTradeData({...tradeData, owners: e.target.value})} placeholder="לדוג': 1" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-right" required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg flex items-center justify-center gap-2 flex-row-reverse">
                  שלח בקשה בוואטסאפ <MessageCircle className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-right">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-950 flex-row-reverse">
              <button onClick={() => setIsAdminOpen(false)} className="text-neutral-400 hover:text-white"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 flex-row-reverse"><Settings className="w-6 h-6 text-red-600" /> ניהול מלאי - אוטו מרקט</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 flex-row-reverse"><Plus className="w-5 h-5 text-red-600" /> הוספת רכב</h3>
                <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <select required value={newCar.make} onChange={e => setNewCar({...newCar, make: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right">
                    <option value="">בחר יצרן</option>
                    {ISRAELI_CAR_MAKES.map(make => <option key={make} value={make}>{make}</option>)}
                  </select>
                  <input required type="text" placeholder="דגם" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input required type="text" placeholder="תת דגם" value={newCar.subModel} onChange={e => setNewCar({...newCar, subModel: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input required type="number" placeholder="שנתון" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <select value={newCar.condition} onChange={e => setNewCar({...newCar, condition: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right">
                    <option value="משומש">משומש</option>
                    <option value="חדש">חדש</option>
                  </select>
                  <select value={newCar.engineType} onChange={e => setNewCar({...newCar, engineType: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right">
                    {['בנזין','הייבריד','חשמלי','דיזל','פלאג אין הייבריד'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input required type="text" placeholder="קילומטראז'" value={newCar.mileage} onChange={e => setNewCar({...newCar, mileage: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input required type="number" placeholder="יד הרכב" value={newCar.owners} onChange={e => setNewCar({...newCar, owners: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input required type="text" placeholder="נפח מנוע סמ״ק" value={newCar.engineCapacity} onChange={e => setNewCar({...newCar, engineCapacity: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input required type="text" placeholder="מחיר בפועל (₪)" value={newCar.price} onChange={e => setNewCar({...newCar, price: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <input type="text" placeholder="החזר חודשי החל מ- (₪)" value={newCar.monthlyPayment} onChange={e => setNewCar({...newCar, monthlyPayment: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right" />
                  <div className="flex gap-2 flex-row-reverse">
                    <input type="text" placeholder="מחיר מחירון (אופציונלי)" value={newCar.listPrice} onChange={e => setNewCar({...newCar, listPrice: e.target.value})} disabled={!newCar.showListPrice} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white disabled:opacity-50 text-right" />
                    <label className="flex items-center gap-1 text-xs text-neutral-400 cursor-pointer w-16 leading-tight flex-row-reverse">
                      <input type="checkbox" checked={newCar.showListPrice} onChange={e => setNewCar({...newCar, showListPrice: e.target.checked})} className="accent-red-600" />
                      הצג
                    </label>
                  </div>
                  <select value={newCar.type} onChange={e => setNewCar({...newCar, type: e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-right">
                    {['משפחתי','יוקרה','ספורט','SUV'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-neutral-400 mb-1">תמונות (עד 10)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-1 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-red-600 file:text-white cursor-pointer text-right" />
                    {newCar.images && newCar.images.length > 0 && <p className="text-xs text-green-500 mt-1 font-medium">✓ נבחרו {newCar.images.length} תמונות</p>}
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg h-[42px] flex flex-row-reverse items-center justify-center gap-1">
                      העלה רכב <Plus className="w-4 h-4 inline" />
                    </button>
                  </div>
                </form>
              </div>

              <h3 className="text-xl font-bold mb-4">המלאי הנוכחי ({inventory.length} רכבים)</h3>
              <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="p-4 text-center">פעולות</th>
                      <th className="p-4">מחיר (₪)</th>
                      <th className="p-4">מצב רכב</th>
                      <th className="p-4">יצרן ודגם</th>
                      <th className="p-4 text-right">תמונה</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {inventory.map(car => (
                      <tr key={car.id} className="hover:bg-neutral-900/50">
                        <td className="p-4 text-center"><button onClick={() => handleDeleteCar(car.id)} className="text-neutral-500 hover:text-red-500"><Trash2 className="w-5 h-5 inline" /></button></td>
                        <td className="p-4 text-red-500 font-bold text-lg">
                          ₪ {car.price}
                          {car.monthlyPayment && <div className="text-xs text-neutral-400 font-medium">מ- ₪ {car.monthlyPayment} לחודש</div>}
                        </td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${car.condition==='חדש'?'bg-red-600/20 text-red-500':'bg-neutral-700 text-neutral-300'}`}>{car.condition}</span></td>
                        <td className="p-4 font-medium">{car.make} {car.model}<br/><span className="text-xs text-neutral-500">{car.year} | {car.engineType}</span></td>
                        <td className="p-4 text-right"><img src={car.image || '/back.jpg'} alt={car.model} className="w-16 h-10 object-cover rounded bg-neutral-800 mr-0 ml-auto" onError={(e) => { e.target.src = '/back.jpg' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDealershipApp;
