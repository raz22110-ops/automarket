import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Car, Shield, DollarSign, ChevronRight, Menu, X, Star, Settings, Plus, Trash2, ArrowRight, Check, Calendar, Gauge, MessageCircle, Quote, Upload, User, Zap, CreditCard, Truck } from 'lucide-react';

const mySupabaseUrl = 'https://pghsiondbznscjmmvijz.supabase.co';
const mySupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaHNpb25kYnpuc2NqbW12aWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTgxOTYsImV4cCI6MjA5MzM3NDE5Nn0.1XbCpdkU1_YflpvYtSJ-cZDdDotGTKbVESu_Cf7E9hA';

const supabaseHeaders = {
  'apikey': mySupabaseKey,
  'Authorization': `Bearer ${mySupabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const ISRAELI_CAR_MAKES = [
  "אאודי","אופל","אורא","איסוזו","אומודה","אינפיניטי","איווקו","אלפא רומיאו","אמ-גי","אסטון-מרטין",
  "במוו","בי-ווי-די (BYD)","גאקו","ג'יפ","ג'נסיס","ג'ילי","גרייטוול","דאצ'יה","דודג'",
  "הונדה","יונדאי","וולוו","טויוטה","טסלה","יגואר","לנד רובר","לאדה","לקסוס","מאזדה",
  "מזראטי","מיני","מיצובישי","מרצדס","ניסאן","סאנגיונג","סובארו","סוזוקי",
  "סיאט","סיטרואן","סמארט","סקודה","פולקסווגן","פורד","פורשה","פיאט","פיג'ו",
  "פרארי","צ'רי","KGM","קאדילק","קופרה","קיה","רנו","שברולט"
].sort();

const INPUT_CLASS = "w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-red-600 focus:outline-none text-right text-base";
const SELECT_CLASS = "w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:border-red-600 focus:outline-none text-right appearance-none text-base";

const CarDealershipApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  
  // Finance Form States
  const [isFinanceAppOpen, setIsFinanceAppOpen] = useState(false);
  const [financeAppStatus, setFinanceAppStatus] = useState('idle');
  const [financeData, setFinanceData] = useState({ name: '', phone: '', occupation: '', income: '' });
  const [financeFiles, setFinanceFiles] = useState({ idImage: null, idAttachment: null, license: null, ccFront: null, ccBack: null });

  // Digital Order States
  const [isDigitalOrderOpen, setIsDigitalOrderOpen] = useState(false);
  const [digitalOrderCar, setDigitalOrderCar] = useState(null);
  const [digitalOrderStatus, setDigitalOrderStatus] = useState('idle');
  const [digitalOrderData, setDigitalOrderData] = useState({
    name: '', phone: '', id: '', ccNumber: '', ccExp: '', ccCvv: '', delivery: 'pickup'
  });

  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
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
  const [tradeData, setTradeData] = useState({ name:'',phone:'',make:'',model:'',year:'',engine:'',km:'',ownership:'',owners:'' });

  const EMPTY_CAR = { make:'',model:'',subModel:'',year:'',condition:'משומש',engineType:'בנזין',mileage:'',owners:'',engineCapacity:'',price:'',monthlyPayment:'',listPrice:'',showListPrice:false,images:[],type:'משפחתי', showOnHome: false };
  const [newCar, setNewCar] = useState(EMPTY_CAR);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [editCar, setEditCar] = useState(null);
  const [editStatus, setEditStatus] = useState('idle');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [editSelectedFiles, setEditSelectedFiles] = useState([]); 

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await fetch(`${mySupabaseUrl}/rest/v1/inventory?select=*&order=createdAt.desc`, {
        method: 'GET',
        headers: {
          'apikey': mySupabaseKey,
          'Authorization': `Bearer ${mySupabaseKey}`
        }
      });
      if (!response.ok) throw new Error('שגיאה במשיכת נתונים');
      const data = await response.json();
      setInventory(data || []);
    } catch (err) { console.error(err); }
    finally { setInventoryLoading(false); }
  };

  const calculateMonthly = () => {
    const principal = Math.max(0, financePrice - financeDownPayment);
    if (!principal || !financePayments) return 0;
    const r = (financeCondition === 'new' ? 0.045 : 0.061) / 12;
    return Math.round((principal * r) / (1 - Math.pow(1 + r, -financePayments)));
  };

  const resizeImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > 1280) { h = h * 1280 / w; w = 1280; }
        if (h > 720) { w = w * 720 / h; h = 720; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const uploadImagesToStorage = async (files) => {
      const uploadedUrls = [];
      for (const file of files) {
          const blob = await resizeImage(file);
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`; 
          
          const response = await fetch(`${mySupabaseUrl}/storage/v1/object/car-images/${fileName}`, {
            method: 'POST',
            headers: {
              'apikey': mySupabaseKey,
              'Authorization': `Bearer ${mySupabaseKey}`,
              'Content-Type': 'image/jpeg'
            },
            body: blob
          });

          if (!response.ok) {
              console.error("Error uploading image");
              throw new Error("Upload failed");
          }

          const publicUrl = `${mySupabaseUrl}/storage/v1/object/public/car-images/${fileName}`;
          uploadedUrls.push(publicUrl);
      }
      return uploadedUrls;
  };

  const handleImageSelection = (e, target = 'new') => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 10) { alert('עד 10 תמונות'); return; }
    
    if (target === 'new') {
        setSelectedFiles(files);
        setNewCar(p => ({ ...p, images: Array(files.length).fill('pending') })); 
    } else {
        setEditSelectedFiles(files);
        setEditCar(p => ({ ...p, images: Array(files.length).fill('pending') }));
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault(); 
    setUploadStatus('loading');
    
    try {
      let imageUrls = [];
      if (selectedFiles.length > 0) {
          imageUrls = await uploadImagesToStorage(selectedFiles);
      }

      const carToAdd = { 
          ...newCar, 
          id: Date.now().toString(), 
          images: imageUrls, 
          image: imageUrls.length > 0 ? imageUrls[0] : '', 
          createdAt: Date.now() 
      };
      
      const response = await fetch(`${mySupabaseUrl}/rest/v1/inventory`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(carToAdd)
      });
      if (!response.ok) throw new Error('שגיאה בשמירת הרכב');
      
      setInventory(p => [carToAdd, ...p]); 
      setNewCar(EMPTY_CAR); 
      setSelectedFiles([]);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3500);
    } catch (err) { 
        console.error(err);
        setUploadStatus('error'); 
        setTimeout(() => setUploadStatus('idle'), 4000); 
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault(); 
    setEditStatus('loading');
    
    try {
      let imageUrls = editCar.images || []; 
      
      if (editSelectedFiles.length > 0) {
          imageUrls = await uploadImagesToStorage(editSelectedFiles);
      }

      const updatedCar = {
          ...editCar,
          images: imageUrls,
          image: imageUrls.length > 0 ? imageUrls[0] : (editCar.image || '')
      };

      const response = await fetch(`${mySupabaseUrl}/rest/v1/inventory?id=eq.${updatedCar.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(updatedCar)
      });
      if (!response.ok) throw new Error('שגיאה בעדכון הרכב');
      
      setInventory(p => p.map(c => c.id === updatedCar.id ? updatedCar : c));
      setEditStatus('success');
      setEditSelectedFiles([]);
      setTimeout(() => { setEditStatus('idle'); setEditCar(null); }, 1800);
    } catch (err) { 
        console.error(err);
        setEditStatus('error'); 
        setTimeout(() => setEditStatus('idle'), 4000); 
    }
  };

  const handleDeleteCar = async (id) => {
    try {
      const response = await fetch(`${mySupabaseUrl}/rest/v1/inventory?id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
      if (!response.ok) throw new Error('שגיאה במחיקת הרכב');
      setInventory(p => p.filter(c => c.id !== id)); setDeleteConfirmId(null);
    } catch { alert('שגיאה במחיקה'); }
  };

  const handleTradeInSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${mySupabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ name: tradeData.name, phone: tradeData.phone, lead_type: 'טרייד-אין', car_details: `${tradeData.make} ${tradeData.model} (${tradeData.year})` })
      });
    } catch (err) { console.error(err); }
    const text = `שלום, אשמח לקבל הצעת טרייד-אין.\n\n*פרטי התקשרות:*\nשם: ${tradeData.name}\nטלפון: ${tradeData.phone}\n\n*פרטי הרכב שלי:*\nיצרן: ${tradeData.make}\nדגם: ${tradeData.model}\nשנתון: ${tradeData.year}\nסוג הנעה: ${tradeData.engine}\nקילומטראז': ${tradeData.km}\nבעלות: ${tradeData.ownership}\nיד: ${tradeData.owners}`;
    window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');
    setIsTradeInOpen(false);
  };

  const handleFinanceAppSubmit = async (e) => {
    e.preventDefault();
    setFinanceAppStatus('loading');
    try {
      const uploadSingleFile = async (file) => {
        if (!file) return 'לא הועלה';
        const urls = await uploadImagesToStorage([file]);
        return urls[0] || 'לא הועלה';
      };

      const idUrl = await uploadSingleFile(financeFiles.idImage);
      const attachmentUrl = await uploadSingleFile(financeFiles.idAttachment);
      const licenseUrl = await uploadSingleFile(financeFiles.license);
      const ccFrontUrl = await uploadSingleFile(financeFiles.ccFront);
      const ccBackUrl = await uploadSingleFile(financeFiles.ccBack);

      const details = `עיסוק: ${financeData.occupation} \nהכנסה משותפת: ₪${financeData.income} \nת.ז קדמי: ${idUrl} \nספח פתוח: ${attachmentUrl} \nרישיון נהיגה: ${licenseUrl} \nאשראי קדמי: ${ccFrontUrl} \nאשראי אחורי: ${ccBackUrl}`;

      await fetch(`${mySupabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ 
          name: financeData.name, 
          phone: financeData.phone, 
          lead_type: 'אישור מימון דיגיטלי', 
          car_details: details 
        })
      });

      const text = `שלום, הגשתי בקשה לאישור מימון מהיר בדיגיטל.\nשם: ${financeData.name}\nטלפון: ${financeData.phone}\nעיסוק: ${financeData.occupation}\nהכנסה חודשית (בעל+אישה): ₪${financeData.income}\n\n*כל המסמכים הועלו בהצלחה למערכת.*`;
      window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');

      setFinanceAppStatus('success');
      setTimeout(() => {
        setFinanceAppStatus('idle');
        setIsFinanceAppOpen(false);
        setFinanceData({ name: '', phone: '', occupation: '', income: '' });
        setFinanceFiles({ idImage: null, idAttachment: null, license: null, ccFront: null, ccBack: null });
      }, 2000);
    } catch (error) {
      console.error(error);
      setFinanceAppStatus('error');
      setTimeout(() => setFinanceAppStatus('idle'), 4000);
    }
  };

  const handleDigitalOrderSubmit = async (e) => {
    e.preventDefault();
    setDigitalOrderStatus('loading');
    try {
      const getDepositTotal = () => {
        let base = 2000;
        if (digitalOrderData.delivery === 'tow') base += 500;
        if (digitalOrderData.delivery === 'display') base += 2000;
        return base;
      };

      const depositAmount = getDepositTotal();
      const deliveryText = digitalOrderData.delivery === 'display' ? 'משאית תצוגה VIP (₪2000)' : digitalOrderData.delivery === 'tow' ? 'גרר (₪500)' : 'איסוף מהסוכנות (חינם)';
      const maskedCC = digitalOrderData.ccNumber.slice(-4) || '****';

      const details = `רכב: ${digitalOrderCar?.make} ${digitalOrderCar?.model} (${digitalOrderCar?.year})
סוג מסירה: ${deliveryText}
סך הכל לתשלום מקדמה: ₪${depositAmount}
אשראי שסיים ב: ${maskedCC}
ת.ז בעל הכרטיס: ${digitalOrderData.id}`;

      await fetch(`${mySupabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ 
          name: digitalOrderData.name, 
          phone: digitalOrderData.phone, 
          lead_type: 'הזמנה דיגיטלית - תשלום מקדמה', 
          car_details: details 
        })
      });

      const waText = `שלום, ביצעתי כרגע הזמנה דיגיטלית ושילמתי מקדמה בסך ₪${depositAmount} עבור ${digitalOrderCar?.make} ${digitalOrderCar?.model} חדש.\n*סוג מסירה:* ${deliveryText}\nשם: ${digitalOrderData.name}\nטלפון: ${digitalOrderData.phone}\nאשראי מסיים ב-${maskedCC}`;
      window.open(`https://wa.me/972526441855?text=${encodeURIComponent(waText)}`, '_blank');

      setDigitalOrderStatus('success');
      setTimeout(() => {
        setDigitalOrderStatus('idle');
        setIsDigitalOrderOpen(false);
        setDigitalOrderData({ name: '', phone: '', id: '', ccNumber: '', ccExp: '', ccCvv: '', delivery: 'pickup' });
        setDigitalOrderCar(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      setDigitalOrderStatus('error');
      setTimeout(() => setDigitalOrderStatus('idle'), 4000);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === '159852') { setIsPasswordPromptOpen(false); setIsAdminOpen(true); setAdminPassword(''); setPasswordError(''); }
    else setPasswordError('סיסמה שגויה, נסה שוב.');
  };

  const handleFinanceSearch = () => {
    const max = calculateMonthly();
    const results = inventory.filter(c => c.monthlyPayment && Number(c.monthlyPayment.toString().replace(/,/g,'')) <= max);
    setSearchResults(results); setSearchTitle('תוצאות חיפוש מימון');
    setSearchSubtitle(`נמצאו ${results.length} רכבים בהחזר חודשי עד ₪${max.toLocaleString()}`);
    navigateTo('search');
  };

  const handleRegularSearch = () => {
    const results = inventory.filter(c => {
      if (searchMake && c.make !== searchMake) return false;
      if (searchCondition && c.condition !== searchCondition) return false;
      if (searchCategory && c.type !== searchCategory) return false;
      if (searchBudget && Number(c.price.toString().replace(/,/g,'')) > searchBudget) return false;
      return true;
    });
    setSearchResults(results); setSearchTitle('תוצאות חיפוש');
    setSearchSubtitle(`נמצאו ${results.length} רכבים התואמים לחיפוש שלך.`);
    navigateTo('search');
  };

  const navigateTo = (view, hash = null) => {
    setCurrentView(view); setSelectedCar(null); setIsMenuOpen(false);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    else window.scrollTo(0, 0);
  };

  const testimonials = [
    { id:1, name:'יוסי אהרוני', text:'שירות מעל ומעבר! קניתי מרצדס והרגשתי לאורך כל הדרך שדואגים לי באמת. שקיפות מלאה וטיפול אישי. ממליץ בחום.', car:'קנה: Mercedes S-Class' },
    { id:2, name:'מיכל לוי', text:'חיפשתי רכב פנאי למשפחה ועזרו לי למצוא בדיוק את מה שהייתי צריכה. עשו לי טרייד אין הוגן על הרכב הישן שלי. אלופים.', car:'קנתה: Range Rover Sport' },
    { id:3, name:'דניאל כהן', text:'סוכנות ברמה אירופאית. רכבים מדהימים ותנאי מימון שאי אפשר למצוא במקומות אחרים. חווית קנייה חלקה ומהירה.', car:'קנה: Porsche 911' }
  ];

  /* ───────── CAR CARD ───────── */
  const CarGrid = ({ cars }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
      {inventoryLoading ? (
        <div className="col-span-full py-20 text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-neutral-400">טוען מלאי מהענן...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="col-span-full py-20 text-center">
          <Car className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">לא נמצאו רכבים</h3>
          <p className="text-neutral-400">כרגע אין רכבים בקטגוריה זו במלאי.</p>
        </div>
      ) : cars.map(car => (
        <div key={car.id} className="group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-red-600/50 transition-all duration-300 active:scale-[0.98]">
          <div className="relative h-52 sm:h-60 overflow-hidden bg-neutral-800">
            <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">{car.type}</div>
            <div className={`absolute top-3 left-3 z-10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border ${car.condition==='חדש'?'bg-red-600/90 text-white border-red-500':'bg-neutral-600/80 text-white border-neutral-500'}`}>{car.condition}</div>
            <img src={car.image||'/back.jpg'} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e=>e.target.src='/back.jpg'} />
          </div>
          <div className="p-4 text-right">
            <div className="flex justify-between items-start mb-3 flex-row-reverse">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{car.make} {car.model}</h3>
                <p className="text-neutral-400 text-xs mt-0.5">{car.year} | {car.subModel}</p>
              </div>
              <div className="text-left">
  {car.showListPrice && car.listPrice && <span className="text-neutral-500 line-through text-xs block mb-0.5">₪{car.listPrice}</span>}
  <p className="text-base font-bold text-red-600 leading-none">₪ {car.price}</p>
  {car.monthlyPayment && (
    <div className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md mt-1.5 inline-block shadow-sm">
      החל מ-₪{car.monthlyPayment} בחודש
    </div>
  )}
</div>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-4 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
              <div className="flex items-center justify-end gap-1.5">{car.mileage} ק"מ<Gauge className="w-3.5 h-3.5 text-neutral-500"/></div>
              <div className="flex items-center justify-end gap-1.5">יד {car.owners}<User className="w-3.5 h-3.5 text-neutral-500"/></div>
              <div className="flex items-center justify-end gap-1.5">{car.engineCapacity} סמ"ק<Settings className="w-3.5 h-3.5 text-neutral-500"/></div>
              <div className="flex items-center justify-end gap-1.5">{car.engineType}<Zap className="w-3.5 h-3.5 text-neutral-500"/></div>
            </div>
            <button onClick={()=>{setSelectedCar(car);window.scrollTo(0,0);}} className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors text-sm shadow-lg shadow-red-600/20">לפרטים נוספים</button>
          </div>
        </div>
      ))}
    </div>
  );

  /* ───────── INVENTORY PAGE ───────── */
  const GenericInventoryPage = ({ cars, title, subtitle }) => (
    <div className="pt-28 md:pt-36 pb-16 bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-neutral-800 pb-6 text-right">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{title}</h1>
          <p className="text-base md:text-xl text-neutral-400">{subtitle}</p>
        </div>
        <CarGrid cars={cars} />
      </div>
    </div>
  );

  /* ───────── CAR DETAILS ───────── */
  const CarDetailsPage = ({ car, onBack, onOpenDigitalOrder }) => {
    const [leadName, setLeadName] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [wantFinance, setWantFinance] = useState(false);
    const [haveTradeIn, setHaveTradeIn] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    const handleLeadSubmit = async (e) => {
      e.preventDefault();
      let type = wantFinance ? 'מימון' : haveTradeIn ? 'טרייד-אין' : 'התעניינות ברכב';
      try {
        await fetch(`${mySupabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify({ name:leadName, phone:leadPhone, lead_type:type, car_details:`${car.make} ${car.model} (${car.year})` })
        });
      } catch (err) { console.error(err); }
      const text = `שלום, אני מתעניין ברכב ${car.make} ${car.model} (${car.year}).\n\nשם: ${leadName}\nטלפון: ${leadPhone}\nמימון: ${wantFinance?'כן':'לא'}\nטרייד-אין: ${haveTradeIn?'כן':'לא'}`;
      window.open(`https://wa.me/972526441855?text=${encodeURIComponent(text)}`, '_blank');
    };

    const imgs = (car.images?.length > 0) ? car.images : [car.image || '/back.jpg'];

    return (
      <div className="pt-28 md:pt-36 pb-10 bg-neutral-950 min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 active:text-red-500 hover:text-red-500 transition-colors mb-6 font-medium bg-neutral-900/50 px-4 py-2.5 rounded-full w-fit border border-neutral-800 ml-auto">
            חזרה <ArrowRight className="w-4 h-4"/>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Gallery + info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Main image */}
              <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 h-56 sm:h-80 md:h-[420px] relative">
                <div className={`absolute top-4 right-4 z-10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border ${car.condition==='חדש'?'bg-red-600/90 text-white border-red-500':'bg-neutral-600/80 text-white border-neutral-500'}`}>{car.condition}</div>
                <img src={imgs[activeImg]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" onError={e=>e.target.src='/back.jpg'} />
              </div>
              {/* Thumbs */}
              {imgs.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 flex-row-reverse">
                  {imgs.map((img,i) => (
                    <div key={i} onClick={()=>setActiveImg(i)} className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImg===i?'border-red-600':'border-transparent opacity-50'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon:<Calendar className="w-6 h-6 text-red-600"/>, label:'שנת ייצור', val:car.year },
                  { icon:<Settings className="w-6 h-6 text-red-600"/>, label:'סוג הנעה', val:car.engineType },
                  { icon:<Gauge className="w-6 h-6 text-red-600"/>, label:"קילומטראז'", val:`${car.mileage} km` },
                  { icon:<Car className="w-6 h-6 text-red-600"/>, label:'קטגוריה', val:car.type },
                ].map((s,i) => (
                  <div key={i} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <p className="text-neutral-400 text-xs mb-1">{s.label}</p>
                    <p className="text-white font-bold text-sm">{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Extra stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center"><p className="text-neutral-400 text-xs mb-1">יד הרכב</p><p className="text-white font-bold">{car.owners}</p></div>
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center"><p className="text-neutral-400 text-xs mb-1">נפח מנוע</p><p className="text-white font-bold">{car.engineCapacity} סמ"ק</p></div>
              </div>
              {/* Why buy */}
              <div className="bg-neutral-900 p-5 md:p-8 rounded-2xl border border-neutral-800">
                <h3 className="text-lg md:text-2xl font-bold text-white mb-4">למה לקנות באוטו מרקט?</h3>
                <ul className="space-y-3">
                  {["אחריות מקיפה על מנוע וגיר.","100% מימון בתנאים הטובים ביותר.","אפשרות לטרייד-אין עתידי.","בדיקה קפדנית לפני מסירה."].map((t,i) => (
                    <li key={i} className="flex items-start gap-3 flex-row-reverse">
                      <div className="mt-0.5 bg-red-600/20 p-1 rounded-full shrink-0"><Check className="w-3.5 h-3.5 text-red-500"/></div>
                      <span className="text-neutral-300 text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar: price + lead form */}
            <div className="space-y-5">
              <div className="bg-neutral-900 p-5 md:p-8 rounded-2xl border border-neutral-800">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{car.make} <span className="text-xl font-normal text-neutral-300">{car.model}</span></h1>
                <p className="text-neutral-400 mb-5">{car.subModel}</p>
                <div className="border-t border-neutral-800 pt-4">
                  {car.showListPrice && car.listPrice && <p className="text-neutral-500 text-sm line-through mb-1">מחירון: ₪{car.listPrice}</p>}
                  <p className="text-3xl md:text-4xl font-bold text-red-600">₪ {car.price}</p>
                  {car.monthlyPayment && <p className="text-sm text-neutral-400 mt-1">החל מ- ₪{car.monthlyPayment} לחודש</p>}
                </div>
              </div>

              <div className="bg-neutral-900 p-5 md:p-8 rounded-2xl border border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                
                {car.condition === 'חדש' && (
                  <div className="mb-6 pb-6 border-b border-neutral-800">
                    <h3 className="text-xl font-bold text-white mb-2 text-right">הבטח את הרכב שלך עכשיו</h3>
                    <p className="text-neutral-400 text-sm mb-4 text-right">שריין את הרכב החדש שלך דיגיטלית עכשיו עם תשלום מקדמה באשראי ותאם את אופן המסירה.</p>
                    <button 
                      onClick={() => onOpenDigitalOrder(car)}
                      className="w-full bg-green-600 active:bg-green-700 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-[0_0_15px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 flex-row-reverse"
                    >
                      להזמנה דיגיטלית מהירה <CreditCard className="w-5 h-5"/>
                    </button>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-1">אני מעוניין ברכב</h3>
                <p className="text-neutral-400 text-sm mb-5">השאר פרטים ונחזור אליך בהקדם.</p>
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input type="text" value={leadName} onChange={e=>setLeadName(e.target.value)} placeholder="שם מלא" className={INPUT_CLASS} required />
                  <input type="tel" value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="מספר טלפון" className={INPUT_CLASS} required />
                  <label className="flex items-center gap-3 py-1 cursor-pointer flex-row-reverse">
                    <input type="checkbox" checked={wantFinance} onChange={e=>setWantFinance(e.target.checked)} className="accent-red-600 w-5 h-5"/>
                    <span className="text-sm text-neutral-300">מעוניין במימון</span>
                  </label>
                  <label className="flex items-center gap-3 py-1 cursor-pointer flex-row-reverse">
                    <input type="checkbox" checked={haveTradeIn} onChange={e=>setHaveTradeIn(e.target.checked)} className="accent-red-600 w-5 h-5"/>
                    <span className="text-sm text-neutral-300">יש לי רכב לטרייד-אין</span>
                  </label>
                  <button type="submit" className="w-full bg-red-600 active:bg-red-700 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-lg flex items-center justify-center gap-2 flex-row-reverse mt-2">
                    שלח בוואטסאפ <MessageCircle className="w-5 h-5"/>
                  </button>
                  <div className="text-center pt-1">
                    <span className="text-neutral-500 text-sm">או התקשר: </span>
                    <a href="tel:052-644-1855" className="text-red-500 font-bold" dir="ltr">052-644-1855</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

/* ───────── MAIN RENDER ───────── */
return (
  <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans" dir="rtl">
  <style>{`
    /* הגדלת כל האתר ב-125% - עובד בצורה מושלמת עם יחידות rem של Tailwind */
    html {
      font-size: 125%;
    }
    /* הגדלה מותאמת אישית רק למובייל (מסכים עד 768px) */
      @media (max-width: 768px) {
        html {
          font-size: 160%; 
        }
      }

      input[type='range'] {
      -webkit-appearance: none;

    input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: #333;
    border-radius: 9999px;
     outline: none;
     cursor: pointer;
    }
    input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
     appearance: none;
     width: 44px;
     height: 24px;
     border-radius: 10px;
     background: #ffffff;
     box-shadow: 0 2px 10px rgba(0,0,0,0.5);
     cursor: grab;
     transition: background 0.15s;
     margin-top: calc((6px - 24px) / 2);
     }
    input[type='range']::-webkit-slider-thumb:active {
     cursor: grabbing;
     background: #f0f0f0;
     }
     input[type='range']::-moz-range-thumb {
     width: 44px;
     height: 24px;
     border-radius: 10px;
     background: #ffffff;
     border: none;
     box-shadow: 0 2px 10px rgba(0,0,0,0.5);
     cursor: grab;
     }
     input[type='range']::-webkit-slider-runnable-track {
     height: 6px;
     border-radius: 9999px;
    background: #333;
     }
  `}</style>

      {/* NAV */}
      <nav className="fixed w-full z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-28 items-center">
            <button onClick={()=>navigateTo('home')} className="bg-transparent border-none p-0">
              <img src="/logo.png" alt="אוטו מרקט" className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.35)]" />
            </button>
            <div className="hidden lg:flex items-center gap-6 flex-row-reverse">
              <button onClick={()=>navigateTo('home')} className={`font-medium transition-colors ${currentView==='home'&&!selectedCar?'text-red-500':'text-neutral-300 hover:text-red-500'}`}>ראשי</button>
              <button onClick={()=>navigateTo('new')} className={`font-medium transition-colors ${currentView==='new'&&!selectedCar?'text-red-500':'text-neutral-300 hover:text-red-500'}`}>רכבים חדשים</button>
              <button onClick={()=>navigateTo('used')} className={`font-medium transition-colors ${currentView==='used'&&!selectedCar?'text-red-500':'text-neutral-300 hover:text-red-500'}`}>רכבים משומשים</button>
              <button onClick={()=>navigateTo('home','about')} className="font-medium text-neutral-300 hover:text-red-500 transition-colors">אודותינו</button>
              <button onClick={()=>setIsTradeInOpen(true)} className="text-red-500 font-bold hover:text-red-400">הצעת טרייד אין</button>
              <button onClick={()=>navigateTo('home','contact')} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-500">צור קשר</button>
            </div>
            <button onClick={()=>setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-neutral-300 hover:text-white p-2">
              {isMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-t border-neutral-800">
            {[
              { label:'ראשי', action:()=>navigateTo('home') },
              { label:'רכבים חדשים', action:()=>navigateTo('new') },
              { label:'רכבים משומשים', action:()=>navigateTo('used') },
              { label:'אודותינו', action:()=>navigateTo('home','about') },
            ].map((item,i) => (
              <button key={i} onClick={item.action} className="block w-full text-right px-5 py-4 text-neutral-300 hover:text-red-500 border-b border-neutral-800/60 text-base font-medium">{item.label}</button>
            ))}
            <button onClick={()=>{setIsTradeInOpen(true);setIsMenuOpen(false);}} className="block w-full text-right px-5 py-4 text-red-500 font-bold border-b border-neutral-800/60 text-base">הצעת טרייד אין</button>
            <div className="p-4">
              <button onClick={()=>navigateTo('home','contact')} className="block w-full text-center py-3.5 bg-red-600 text-white font-bold rounded-2xl text-base">צור קשר</button>
            </div>
          </div>
        )}
      </nav>

      {/* VIEWS */}
      {selectedCar ? (
        <CarDetailsPage 
          car={selectedCar} 
          onBack={()=>setSelectedCar(null)} 
          onOpenDigitalOrder={(car) => {
            setDigitalOrderCar(car);
            setIsDigitalOrderOpen(true);
          }}
        />
      ) : currentView==='new' ? (
        <GenericInventoryPage cars={inventory.filter(c=>c.condition==='חדש')} title={<>מלאי <span className="text-red-600">רכבים חדשים</span></>} subtitle={`${inventory.filter(c=>c.condition==='חדש').length} רכבים — כל רכב עבר בדיקה קפדנית.`} />
      ) : currentView==='used' ? (
        <GenericInventoryPage cars={inventory.filter(c=>c.condition==='משומש')} title={<>מלאי <span className="text-red-600">רכבים משומשים</span></>} subtitle={`${inventory.filter(c=>c.condition==='משומש').length} רכבים — כל רכב עבר בדיקה קפדנית.`} />
      ) : currentView==='search' ? (
        <GenericInventoryPage cars={searchResults} title={<span className="text-red-600">{searchTitle}</span>} subtitle={searchSubtitle} />
      ) : (
        <>
          {/* HERO */}
          <div className="relative pt-20 md:pt-28 min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src="/back.jpg" alt="Hero" className="w-full h-full object-cover opacity-40" onError={e=>e.target.src='https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1920&q=80'} />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent"/>
            </div>
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-10">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-white text-center drop-shadow-lg leading-tight">
                המסע שלך לרכב הבא<br/><span className="text-red-600">מתחיל כאן.</span>
              </h1>
              <p className="text-base md:text-xl text-neutral-300 mb-8 max-w-2xl mx-auto text-center">
                אוטו מרקט מתמחה בכל סוגי הרכבים. פתרונות מימון וטרייד-אין מותאמים אישית.
              </p>

              {/* SEARCH BOX */}
              <div className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
                <div className="flex flex-row-reverse border-b border-neutral-800">
                  <button onClick={()=>setSearchTab('finance')} className={`flex-1 py-3.5 font-bold text-sm transition-colors ${searchTab==='finance'?'bg-red-600 text-white':'text-neutral-400 hover:bg-neutral-800'}`}>סימולטור מימון</button>
                  <button onClick={()=>setSearchTab('regular')} className={`flex-1 py-3.5 font-bold text-sm transition-colors ${searchTab==='regular'?'bg-red-600 text-white':'text-neutral-400 hover:bg-neutral-800'}`}>חיפוש רכב</button>
                </div>
                <div className="p-4 md:p-6">
                  {searchTab==='regular' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <select value={searchMake} onChange={e=>setSearchMake(e.target.value)} className={SELECT_CLASS}>
                          <option value="">כל היצרנים</option>
                          {ISRAELI_CAR_MAKES.map(m=><option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                          <select value={searchCondition} onChange={e=>setSearchCondition(e.target.value)} className={SELECT_CLASS}>
                            <option value="">חדש / משומש</option>
                            <option value="חדש">רכב חדש</option>
                            <option value="משומש">רכב משומש</option>
                          </select>
                          <select value={searchCategory} onChange={e=>setSearchCategory(e.target.value)} className={SELECT_CLASS}>
                            <option value="">כל הקטגוריות</option>
                            <option value="משפחתי">משפחתי</option>
                            <option value="יוקרה">יוקרה</option>
                            <option value="ספורט">ספורט</option>
                            <option value="SUV">SUV</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                        <div className="flex justify-between mb-3 flex-row-reverse">
                          <span className="text-neutral-400 text-sm">תקציב מקסימלי</span>
                          <span className="text-white font-bold text-lg">₪{searchBudget.toLocaleString()}</span>
                        </div>
                        <input type="range" min="10000" max="1500000" step="10000" value={searchBudget} onChange={e=>setSearchBudget(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"/>
                      </div>
                      <button onClick={handleRegularSearch} className="w-full bg-red-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-red-500 active:bg-red-700 transition-colors text-base flex-row-reverse">
                        חפש רכבים <Search className="w-5 h-5"/>
                      </button>
                    </div>
                  )}
                  {searchTab==='finance' && (
                    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
                      <div className="lg:col-span-2 flex flex-col gap-3">
                        <div className="flex flex-row-reverse gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                          <button onClick={()=>setFinanceCondition('new')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${financeCondition==='new'?'bg-red-600 text-white':'text-neutral-400'}`}>חדש (4.5%)</button>
                          <button onClick={()=>setFinanceCondition('used')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${financeCondition==='used'?'bg-red-600 text-white':'text-neutral-400'}`}>משומש (6.1%)</button>
                        </div>
                        {[
                          { label:'שווי הרכב', val:financePrice, min:10000, max:800000, step:5000, set:setFinancePrice, fmt:v=>`₪${v.toLocaleString()}` },
                          { label:'מקדמה', val:financeDownPayment, min:0, max:250000, step:5000, set:setFinanceDownPayment, fmt:v=>`₪${v.toLocaleString()}` },
                          { label:'מספר תשלומים', val:financePayments, min:12, max:100, step:1, set:setFinancePayments, fmt:v=>`${v} חודשים` },
                        ].map((s,i) => (
                          <div key={i} className="bg-neutral-950 rounded-xl border border-neutral-800 p-4">
                            <div className="flex justify-between items-center mb-3 flex-row-reverse">
                              <span className="text-neutral-400 text-sm">{s.label}</span>
                              <span className="text-white font-bold text-lg">{s.fmt(s.val)}</span>
                            </div>
                            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e=>s.set(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"/>
                          </div>
                        ))}
                      </div>
                      <div className="bg-neutral-950 p-5 rounded-2xl border border-red-600/40 flex flex-col items-center text-center shadow-[0_0_25px_rgba(220,38,38,0.12)]">
                        <span className="text-neutral-400 text-sm mb-1">החזר חודשי משוער</span>
                        <span className="text-5xl font-black text-red-600 my-3">₪{calculateMonthly().toLocaleString()}</span>
                        <span className="text-xs text-neutral-500 mb-5">*החישוב משוער וכפוף לאישור. ט.ל.ח</span>
                        <button onClick={handleFinanceSearch} className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 flex-row-reverse">
                          מצא רכב בתקציב זה <ChevronRight className="w-5 h-5 rotate-180"/>
                        </button>
                        <button onClick={() => setIsFinanceAppOpen(true)} className="w-full mt-3 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 flex-row-reverse text-sm md:text-base border border-green-500/50">
                          לאישור מימון מהיר דיגיטלי <Shield className="w-5 h-5"/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NEW INVENTORY */}
          <section className="py-14 md:py-24 bg-neutral-950 border-b border-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8 flex-row-reverse">
                <div className="text-right">
                  <h2 className="text-2xl md:text-4xl font-bold">רכבים <span className="text-red-600">חדשים</span></h2>
                  <p className="text-neutral-400 text-sm md:text-base mt-1">מבחר הרכבים החדשים באולם שלנו.</p>
                </div>
                <button onClick={()=>navigateTo('new')} className="hidden md:flex items-center text-red-600 hover:text-red-500 font-semibold gap-1 flex-row-reverse whitespace-nowrap text-sm">
                  כל המלאי ({inventory.filter(c=>c.condition==='חדש').length}) <ChevronRight className="w-4 h-4 rotate-180"/>
                </button>
              </div>
              <CarGrid cars={inventory.filter(c=>c.condition==='חדש' && c.showOnHome).slice(0,6)} />
              <div className="mt-6 text-center md:hidden">
                <button onClick={()=>navigateTo('new')} className="text-red-600 font-semibold flex items-center justify-center gap-1 mx-auto flex-row-reverse text-sm">
                  כל המלאי ({inventory.filter(c=>c.condition==='חדש').length}) <ChevronRight className="w-4 h-4 rotate-180"/>
                </button>
              </div>
            </div>
          </section>

          {/* USED INVENTORY */}
          <section className="py-14 md:py-24 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8 flex-row-reverse">
                <div className="text-right">
                  <h2 className="text-2xl md:text-4xl font-bold">רכבים <span className="text-red-600">משומשים</span></h2>
                  <p className="text-neutral-400 text-sm md:text-base mt-1">רכבי יד שנייה מעולים לאחר בדיקה קפדנית.</p>
                </div>
                <button onClick={()=>navigateTo('used')} className="hidden md:flex items-center text-red-600 hover:text-red-500 font-semibold gap-1 flex-row-reverse whitespace-nowrap text-sm">
                  כל המלאי ({inventory.filter(c=>c.condition==='משומש').length}) <ChevronRight className="w-4 h-4 rotate-180"/>
                </button>
              </div>
              <CarGrid cars={inventory.filter(c=>c.condition==='משומש' && c.showOnHome).slice(0,6)} />
              <div className="mt-6 text-center md:hidden">
                <button onClick={()=>navigateTo('used')} className="text-red-600 font-semibold flex items-center justify-center gap-1 mx-auto flex-row-reverse text-sm">
                  כל המלאי ({inventory.filter(c=>c.condition==='משומש').length}) <ChevronRight className="w-4 h-4 rotate-180"/>
                </button>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section className="py-14 md:py-24 bg-neutral-900 border-y border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 md:mb-16">
                <h2 className="text-2xl md:text-4xl font-bold mb-3">המעטפת <span className="text-red-600">המושלמת</span></h2>
                <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">חווית רכישה מלאה, מימון וטרייד-אין תחת קורת גג אחת.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
                {[
                  { icon:<DollarSign className="w-7 h-7"/>, title:'פתרונות מימון', text:'מימון גמיש עד 100% מול הגופים המובילים.' },
                  { icon:<Car className="w-7 h-7"/>, title:'טרייד אין הוגן', text:'שקיפות מלאה ומחירון הוגן לרכב הישן שלך.' },
                  { icon:<Shield className="w-7 h-7"/>, title:'אחריות ובדיקה', text:'כל רכב עובר בדיקה מקיפה לשקט הנפשי שלך.' },
                ].map((s,i) => (
                  <div key={i} className="bg-neutral-950 p-6 md:p-8 rounded-2xl border border-neutral-800 text-center hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-700 text-red-600">{s.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-neutral-400 text-sm">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="py-14 md:py-24 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:flex-row-reverse">
                <div className="w-full md:w-1/2 text-right">
                  <h2 className="text-2xl md:text-4xl font-bold mb-4">למה לבחור <span className="text-red-600">באוטו מרקט?</span></h2>
                  <p className="text-neutral-300 text-base mb-5 leading-relaxed">שנים של ניסיון בענף הרכב, עם דגש על שקיפות מוחלטת, מקצועיות ושירות VIP.</p>
                  <ul className="space-y-3 mb-6">
                    {[
                      { b:'מבחר מוקפד:', t:'כל רכב נבחר בקפידה ועובר בדיקות קפדניות.' },
                      { b:'שקיפות מלאה:', t:'כל ההיסטוריה של הרכב, ללא הפתעות.' },
                    ].map((item,i) => (
                      <li key={i} className="flex items-start gap-3 flex-row-reverse">
                        <div className="mt-0.5 bg-red-600/20 p-1 rounded-full shrink-0"><Check className="w-3.5 h-3.5 text-red-500"/></div>
                        <span className="text-neutral-300 text-sm"><strong>{item.b}</strong> {item.t}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={()=>navigateTo('home','contact')} className="border-2 border-red-600 text-red-500 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors text-sm">דברו איתנו</button>
                </div>
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-red-600/20 rounded-3xl blur-2xl"/>
                  <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000" alt="אולם תצוגה" className="relative z-10 rounded-3xl shadow-2xl border border-neutral-800 w-full"/>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-14 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600"/>
            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-4">מצאת את רכב החלומות?</h2>
              <p className="text-white/90 text-base md:text-xl mb-8">השאר פרטים ונחזור אליך תוך דקות.</p>
              <form className="flex flex-col gap-3 max-w-lg mx-auto"
                onSubmit={async(e)=>{
                  e.preventDefault();
                  const name=e.target.elements[0].value, phone=e.target.elements[1].value;
                  try {
                    await fetch(`${mySupabaseUrl}/rest/v1/leads`, {
                      method: 'POST',
                      headers: supabaseHeaders,
                      body: JSON.stringify({name,phone,lead_type:'פנייה כללית',car_details:'אין'})
                    });
                  } catch(err){ console.error(err); }
                  window.open(`https://wa.me/972526441855?text=${encodeURIComponent(`שלום, הגעתי מהאתר.\nשם: ${name}\nטלפון: ${phone}`)}`, '_blank');
                }}
              >
                <input type="text" placeholder="שם מלא" className="px-5 py-4 rounded-xl bg-white/95 text-neutral-900 placeholder-neutral-500 focus:outline-none text-right text-base w-full" required />
                <input type="tel" placeholder="מספר טלפון" className="px-5 py-4 rounded-xl bg-white/95 text-neutral-900 placeholder-neutral-500 focus:outline-none text-right text-base w-full" required />
                <button type="submit" className="px-6 py-4 bg-neutral-950 text-white rounded-xl font-bold hover:bg-neutral-800 active:bg-black transition-colors flex items-center justify-center gap-2 flex-row-reverse w-full text-base">
                  שלח בוואטסאפ <MessageCircle className="w-5 h-5"/>
                </button>
              </form>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="py-14 md:py-24 bg-neutral-900 border-y border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-4xl font-bold mb-10 text-center">לקוחות <span className="text-red-600">ממליצים</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-neutral-950 p-5 md:p-8 rounded-2xl border border-neutral-800 text-right">
                    <Quote className="w-8 h-8 text-red-600/20 mb-3"/>
                    <div className="flex gap-1 mb-3 flex-row-reverse">{[1,2,3,4,5].map(s=><Star key={s} className="w-4 h-4 fill-red-500 text-red-500"/>)}</div>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                    <div className="border-t border-neutral-800 pt-3">
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-red-500 text-xs">{t.car}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer id="contact" className="bg-neutral-950 pt-14 md:pt-24 pb-10 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <img src="/logo.png" alt="אוטו מרקט" className="h-16 md:h-20 w-auto object-contain mb-5"/>
            <p className="text-neutral-400 max-w-xl text-sm md:text-lg">חווית רכישה, מימון וטרייד-אין תחת קורת גג אחת.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10 border-t border-neutral-800/50 pt-10">
            <div className="text-right">
              <h4 className="text-white font-bold mb-5 text-lg">יצירת קשר</h4>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex items-center gap-3 flex-row-reverse">
                  <div className="bg-neutral-900 p-2.5 rounded-xl text-red-600"><Phone className="w-5 h-5"/></div>
                  <div>
                    <p className="text-xs text-neutral-500">טלפון</p>
                    <a href="tel:052-644-1855" className="text-white font-bold hover:text-red-500" dir="ltr">052-644-1855</a>
                  </div>
                </li>
                <li className="flex items-center gap-3 flex-row-reverse">
                  <div className="bg-neutral-900 p-2.5 rounded-xl text-red-600"><MapPin className="w-5 h-5"/></div>
                  <div>
                    <p className="text-xs text-neutral-500">כתובת</p>
                    <span className="text-white font-bold text-sm">פרנץ אופנהיימר 2, נתניה</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="text-right sm:text-center">
              <h4 className="text-white font-bold mb-5 text-lg">ניווט מהיר</h4>
              <ul className="space-y-3 text-neutral-400 text-sm">
                {[{l:'רכבים חדשים',a:()=>navigateTo('new')},{l:'רכבים משומשים',a:()=>navigateTo('used')},{l:'טרייד-אין',a:()=>setIsTradeInOpen(true)},{l:'אודותינו',a:()=>navigateTo('home','about')}].map((item,i)=>(
                  <li key={i}><button onClick={item.action} className="hover:text-red-600 transition-colors flex items-center gap-1.5 flex-row-reverse sm:mx-auto"><ChevronRight className="w-3.5 h-3.5 text-red-600 rotate-180"/>{item.l}</button></li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <h4 className="text-white font-bold mb-5 text-lg">שעות פעילות</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                {[{d:"א' - ה'",h:'09:00 - 18:00'},{d:'שישי',h:'09:00 - 13:00'},{d:'שבת',h:null}].map((s,i)=>(
                  <li key={i} className="flex justify-between border-b border-neutral-800/50 pb-2 flex-row-reverse">
                    <span className="text-white">{s.d}</span>
                    {s.h ? <span>{s.h}</span> : <span className="text-red-500">סגור</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 flex-row-reverse text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} Auto Market. כל הזכויות שמורות.</p>
            <div className="flex gap-5 flex-row-reverse">
              <a href="#" className="hover:text-white">תקנון האתר</a>
              <a href="#" className="hover:text-white">נגישות</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/972526441855?text=שלום,%20הגעתי%20מהאתר" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-4 md:right-6 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-40">
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8"/>
      </a>

      {/* Admin FAB */}
      <button onClick={()=>setIsPasswordPromptOpen(true)}
        className="fixed bottom-6 left-4 md:left-6 bg-neutral-800 text-neutral-400 p-3 rounded-full hover:bg-neutral-700 hover:text-white active:scale-95 transition-all z-40">
        <Settings className="w-5 h-5"/>
      </button>

      {/* PASSWORD MODAL */}
      {isPasswordPromptOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 text-right shadow-2xl">
            <div className="flex justify-between items-center mb-5 flex-row-reverse">
              <h3 className="text-xl font-bold text-white">כניסה לניהול מלאי</h3>
              <button onClick={()=>{setIsPasswordPromptOpen(false);setPasswordError('');setAdminPassword('');}} className="text-neutral-400 hover:text-white bg-neutral-800 p-2 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="סיסמה" className={INPUT_CLASS} autoFocus/>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl">כניסה למערכת</button>
            </form>
          </div>
        </div>
      )}

      {/* TRADE-IN MODAL */}
      {isTradeInOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="bg-neutral-900 px-5 py-5 text-center border-b border-neutral-800 shrink-0 rounded-t-3xl sm:rounded-t-2xl relative">
              <button onClick={()=>setIsTradeInOpen(false)} className="absolute top-4 left-4 bg-neutral-800 hover:bg-red-600 p-2 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white">הצעת טרייד אין <span className="text-red-600">מהירה</span></h2>
              <p className="text-neutral-400 text-sm mt-1">מלאו פרטים וקבלו הצעה אטרקטיבית.</p>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleTradeInSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  {label:'שם מלא',key:'name',type:'text',ph:"ישראל ישראלי"},
                  {label:'טלפון',key:'phone',type:'tel',ph:"052-1234567"},
                  {label:'יצרן',key:'make',type:'text',ph:"יונדאי"},
                  {label:'דגם',key:'model',type:'text',ph:"טוסון Elite"},
                  {label:'שנתון',key:'year',type:'number',ph:"2021"},
                ].map(f=>(
                  <div key={f.key}>
                    <label className="block text-neutral-400 mb-1.5 text-xs font-medium">{f.label}</label>
                    <input type={f.type} value={tradeData[f.key]} onChange={e=>setTradeData({...tradeData,[f.key]:e.target.value})} placeholder={f.ph} className={INPUT_CLASS} required/>
                  </div>
                ))}
                <div>
                  <label className="block text-neutral-400 mb-1.5 text-xs font-medium">סוג הנעה</label>
                  <select value={tradeData.engine} onChange={e=>setTradeData({...tradeData,engine:e.target.value})} className={SELECT_CLASS} required>
                    <option value="" disabled>בחר סוג הנעה</option>
                    {['בנזין','הייבריד','חשמלי','דיזל','פלאג אין הייבריד'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1.5 text-xs font-medium">קילומטר</label>
                  <input type="number" value={tradeData.km} onChange={e=>setTradeData({...tradeData,km:e.target.value})} placeholder="45000" className={INPUT_CLASS} required/>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1.5 text-xs font-medium">בעלות מקורית</label>
                  <select value={tradeData.ownership} onChange={e=>setTradeData({...tradeData,ownership:e.target.value})} className={SELECT_CLASS} required>
                    <option value="" disabled>בחר</option>
                    {['פרטית','ליסינג','השכרה','חברה'].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1.5 text-xs font-medium">יד הרכב</label>
                  <input type="number" value={tradeData.owners} onChange={e=>setTradeData({...tradeData,owners:e.target.value})} placeholder="1" className={INPUT_CLASS} required/>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 flex-row-reverse">
                    שלח בוואטסאפ <MessageCircle className="w-5 h-5"/>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE APP MODAL */}
      {isFinanceAppOpen && (
        <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="bg-neutral-900 px-5 py-5 text-center border-b border-neutral-800 shrink-0 rounded-t-3xl sm:rounded-t-2xl relative">
              <button onClick={()=>setIsFinanceAppOpen(false)} className="absolute top-4 left-4 bg-neutral-800 hover:bg-red-600 p-2 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white">בקשה לאישור מימון <span className="text-green-500">מהיר</span></h2>
              <p className="text-neutral-400 text-sm mt-1">מלא את הפרטים ונחזור אליך עם אישור מימון דיגיטלי.</p>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleFinanceAppSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                  <div className="md:col-span-2">
                    <label className="block text-neutral-400 mb-1.5 text-xs font-medium">פרטים אישיים</label>
                  </div>
                  <input type="text" value={financeData.name} onChange={e=>setFinanceData({...financeData, name: e.target.value})} placeholder="שם מלא *" className={INPUT_CLASS} required />
                  <input type="tel" value={financeData.phone} onChange={e=>setFinanceData({...financeData, phone: e.target.value})} placeholder="מספר טלפון *" className={INPUT_CLASS} required />
                  <input type="text" value={financeData.occupation} onChange={e=>setFinanceData({...financeData, occupation: e.target.value})} placeholder="במה אתה עובד? *" className={INPUT_CLASS} required />
                  <input type="number" value={financeData.income} onChange={e=>setFinanceData({...financeData, income: e.target.value})} placeholder="הכנסה חודשית (בעל+אישה) *" className={INPUT_CLASS} required />

                  <div className="md:col-span-2 mt-2">
                    <label className="block text-neutral-400 mb-1.5 text-xs font-medium">מסמכים נדרשים (חובה להעלות את כולם)</label>
                  </div>

                  {[
                    { id: 'idImage', label: 'תעודת זהות (צד קדמי)' },
                    { id: 'idAttachment', label: 'ספח תעודת זהות פתוח' },
                    { id: 'license', label: 'רישיון נהיגה' },
                    { id: 'ccFront', label: 'כרטיס אשראי/דיירקט (קדמי)' },
                    { id: 'ccBack', label: 'כרטיס אשראי/דיירקט (אחורי)' },
                  ].map(doc => (
                    <div key={doc.id} className="relative md:col-span-2 lg:col-span-1">
                      <input type="file" accept="image/*" required onChange={e => setFinanceFiles(prev => ({...prev, [doc.id]: e.target.files[0]}))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between transition-colors flex-row-reverse ${financeFiles[doc.id] ? 'bg-green-600/10 border-green-500' : 'bg-neutral-900 border-neutral-700'}`}>
                         <div className="flex items-center gap-2 flex-row-reverse">
                           <Upload className={`w-4 h-4 ${financeFiles[doc.id] ? 'text-green-500' : 'text-neutral-500'}`}/>
                           <span className={`text-sm ${financeFiles[doc.id] ? 'text-green-400' : 'text-neutral-400'}`}>
                             {financeFiles[doc.id] ? '✓ נבחר קובץ' : doc.label}
                           </span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={financeAppStatus === 'loading'} className={`w-full font-bold py-4 rounded-xl mt-4 transition-colors shadow-lg flex items-center justify-center gap-2 flex-row-reverse ${financeAppStatus === 'loading' ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : financeAppStatus === 'success' ? 'bg-green-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                  {financeAppStatus === 'loading' ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> שולח נתונים ופותח וואטסאפ...</>
                  ) : financeAppStatus === 'success' ? (
                    <><Check className="w-5 h-5"/> הבקשה נשלחה בהצלחה!</>
                  ) : (
                    <>שלח בקשה לאישור דיגיטלי <Shield className="w-5 h-5"/></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL ORDER MODAL */}
      {isDigitalOrderOpen && digitalOrderCar && (
        <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="bg-neutral-900 px-5 py-5 text-center border-b border-neutral-800 shrink-0 rounded-t-3xl sm:rounded-t-2xl relative">
              <button onClick={() => { setIsDigitalOrderOpen(false); setDigitalOrderCar(null); setDigitalOrderStatus('idle'); }} className="absolute top-4 left-4 bg-neutral-800 hover:bg-red-600 p-2 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white mb-1">הזמנה דיגיטלית - תשלום מקדמה</h2>
              <p className="text-neutral-400 text-sm">שריין לעצמך את ה-{digitalOrderCar.make} {digitalOrderCar.model} עכשיו.</p>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleDigitalOrderSubmit} className="space-y-6">
                
                {/* Delivery Options */}
                <div className="space-y-3">
                  <h3 className="text-right text-white font-bold mb-2">בחר אופן מסירה:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'pickup', title: 'איסוף מהסוכנות', price: 0, desc: 'ללא תוספת תשלום' },
                      { id: 'tow', title: 'משלוח בגרר', price: 500, desc: 'עד פתח הבית' },
                      { id: 'display', title: 'משאית תצוגה VIP', price: 2000, desc: 'חווית מסירה מושלמת' }
                    ].map(opt => (
                      <div 
                        key={opt.id} 
                        onClick={() => setDigitalOrderData({...digitalOrderData, delivery: opt.id})}
                        className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${digitalOrderData.delivery === opt.id ? 'bg-green-600/10 border-green-500' : 'bg-neutral-900 border-neutral-700 hover:border-neutral-500'}`}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2 flex-row-reverse">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${digitalOrderData.delivery === opt.id ? 'border-green-500' : 'border-neutral-500'}`}>
                             {digitalOrderData.delivery === opt.id && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          </div>
                          <span className={`font-bold ${digitalOrderData.delivery === opt.id ? 'text-green-500' : 'text-white'}`}>{opt.title}</span>
                        </div>
                        <div className="text-neutral-400 text-xs">{opt.desc}</div>
                        <div className="font-bold text-white mt-2">{opt.price > 0 ? `+ ₪${opt.price}` : 'חינם'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CC Form */}
                <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <span className="text-white font-bold text-lg">פרטי תשלום</span>
                    <LockIcon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <input type="text" value={digitalOrderData.name} onChange={e=>setDigitalOrderData({...digitalOrderData, name: e.target.value})} placeholder="שם בעל הכרטיס" className={`${INPUT_CLASS} col-span-2 sm:col-span-1`} required />
                    <input type="text" value={digitalOrderData.id} onChange={e=>setDigitalOrderData({...digitalOrderData, id: e.target.value})} placeholder="תעודת זהות" className={`${INPUT_CLASS} col-span-2 sm:col-span-1`} required />
                    <input type="tel" value={digitalOrderData.phone} onChange={e=>setDigitalOrderData({...digitalOrderData, phone: e.target.value})} placeholder="מספר טלפון" className={`${INPUT_CLASS} col-span-2`} required />
                    
                    <div className="col-span-2 mt-2 mb-1 border-t border-neutral-800 pt-4 flex items-center justify-end gap-2">
                      <span className="text-neutral-400 text-sm font-medium">סביבה מאובטחת תקן PCI-DSS</span>
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    
                    <input type="text" value={digitalOrderData.ccNumber} onChange={e=>setDigitalOrderData({...digitalOrderData, ccNumber: e.target.value.replace(/\D/g, '')})} placeholder="מספר כרטיס אשראי" className={`${INPUT_CLASS} col-span-2 text-left bg-neutral-950`} required maxLength="16" dir="ltr" />
                    <input type="text" value={digitalOrderData.ccExp} onChange={e=>setDigitalOrderData({...digitalOrderData, ccExp: e.target.value})} placeholder="תוקף (MM/YY)" className={`${INPUT_CLASS} col-span-1 text-center bg-neutral-950`} required maxLength="5" dir="ltr" />
                    <input type="text" value={digitalOrderData.ccCvv} onChange={e=>setDigitalOrderData({...digitalOrderData, ccCvv: e.target.value.replace(/\D/g, '')})} placeholder="CVV" className={`${INPUT_CLASS} col-span-1 text-center bg-neutral-950`} required maxLength="4" dir="ltr" />
                  </div>
                </div>

                {/* Total & Submit */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex-row-reverse">
                    <span className="text-neutral-300">סה"כ חיוב מקדמה:</span>
                    <span className="text-2xl font-black text-green-500">
                      ₪{(2000 + (digitalOrderData.delivery === 'display' ? 2000 : digitalOrderData.delivery === 'tow' ? 500 : 0)).toLocaleString()}
                    </span>
                  </div>
                  
                  <button type="submit" disabled={digitalOrderStatus === 'loading'} className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 flex-row-reverse ${digitalOrderStatus === 'loading' ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : digitalOrderStatus === 'success' ? 'bg-green-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
                    {digitalOrderStatus === 'loading' ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> מעבד תשלום...</>
                    ) : digitalOrderStatus === 'success' ? (
                      <><Check className="w-5 h-5"/> התשלום עבר בהצלחה!</>
                    ) : (
                      <>בצע תשלום ושריין רכב <CreditCard className="w-5 h-5"/></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex-row-reverse shrink-0">
              <button onClick={()=>setIsAdminOpen(false)} className="bg-neutral-800 hover:bg-red-600 p-2 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              <div className="flex items-center gap-3 flex-row-reverse">
                <Settings className="w-5 h-5 text-red-600"/>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-white">ניהול מלאי</h2>
                  <p className="text-xs text-neutral-500">{inventory.length} רכבים</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Add car form */}
              <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="flex items-center gap-2 flex-row-reverse px-4 py-3 border-b border-neutral-800 bg-neutral-900/60">
                  <Plus className="w-4 h-4 text-red-600"/><h3 className="font-bold text-white text-sm">הוספת רכב חדש</h3>
                </div>
                <div className="p-4">
                  <form onSubmit={handleAddCar} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                    <select required value={newCar.make} onChange={e=>setNewCar({...newCar,make:e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-red-600 outline-none col-span-2 md:col-span-1">
                      <option value="">יצרן *</option>{ISRAELI_CAR_MAKES.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                    {[
                      {ph:'דגם *',k:'model',t:'text'},{ph:'תת דגם *',k:'subModel',t:'text'},{ph:'שנתון *',k:'year',t:'number'},
                      {ph:'קילומטראז\' *',k:'mileage',t:'text'},{ph:'יד הרכב *',k:'owners',t:'number'},{ph:'נפח מנוע סמ"ק *',k:'engineCapacity',t:'text'},
                      {ph:'מחיר ₪ *',k:'price',t:'text'},{ph:'החזר חודשי ₪',k:'monthlyPayment',t:'text'},
                    ].map(f=>(
                      <input key={f.k} required={f.ph.includes('*')} type={f.t} placeholder={f.ph} value={newCar[f.k]} onChange={e=>setNewCar({...newCar,[f.k]:e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-red-600 outline-none"/>
                    ))}
                    <select value={newCar.condition} onChange={e=>setNewCar({...newCar,condition:e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-red-600 outline-none">
                      <option value="משומש">משומש</option><option value="חדש">חדש</option>
                    </select>
                    <select value={newCar.engineType} onChange={e=>setNewCar({...newCar,engineType:e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-red-600 outline-none">
                      {['בנזין','הייבריד','חשמלי','דיזל','פלאג אין הייבריד'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={newCar.type} onChange={e=>setNewCar({...newCar,type:e.target.value})} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-red-600 outline-none">
                      {['משפחתי','יוקרה','ספורט','SUV'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                    <div className="col-span-2 md:col-span-3 flex items-center gap-4 flex-row-reverse bg-neutral-900/50 p-2 rounded-xl border border-neutral-800">
  <div className="flex-1 flex items-center gap-2 flex-row-reverse">
    <input type="text" placeholder="מחיר מחירון ₪" value={newCar.listPrice} onChange={e=>setNewCar({...newCar,listPrice:e.target.value})} disabled={!newCar.showListPrice} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white disabled:opacity-40 text-right outline-none"/>
    <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer whitespace-nowrap flex-row-reverse">
      <input type="checkbox" checked={newCar.showListPrice} onChange={e=>setNewCar({...newCar,showListPrice:e.target.checked})} className="accent-red-600 w-4 h-4"/>הצג מחירון
    </label>
  </div>
  <label className="flex items-center gap-2 text-sm text-white font-bold cursor-pointer whitespace-nowrap flex-row-reverse bg-red-600/20 px-4 py-2.5 rounded-lg border border-red-600/40 hover:bg-red-600/30 transition-colors">
    <input type="checkbox" checked={newCar.showOnHome || false} onChange={e=>setNewCar({...newCar,showOnHome:e.target.checked})} className="accent-red-600 w-4 h-4"/>
    הצג בדף הבית
  </label>
</div>
                    
                    <div className="col-span-2 md:col-span-3">
                      <label className="block text-xs text-neutral-400 mb-1.5">העלאת תמונות (עד 10 תמונות)</label>
                      <input type="file" accept="image/*" multiple onChange={e=>handleImageSelection(e,'new')} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs file:ml-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-red-600 file:text-white cursor-pointer"/>
                      {selectedFiles.length>0 && <p className="text-xs text-green-500 mt-1">✓ {selectedFiles.length} תמונות נבחרו להעלאה</p>}
                    </div>

                    <button type="submit" disabled={uploadStatus==='loading'} className={`col-span-2 md:col-span-1 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 flex-row-reverse transition-all text-white ${uploadStatus==='loading'?'bg-neutral-700 cursor-not-allowed':'bg-red-600 hover:bg-red-500'}`}>
                      {uploadStatus==='loading'?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>מעלה...</>:<><Plus className="w-4 h-4"/>העלה רכב</>}
                    </button>
                  </form>
                  {uploadStatus==='success' && <div className="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 flex-row-reverse"><Check className="w-5 h-5"/><span className="text-sm font-medium">הרכב הועלה בהצלחה! 🎉</span></div>}
                  {uploadStatus==='error' && <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex-row-reverse"><X className="w-5 h-5"/><span className="text-sm">שגיאה — בדוק את ההגדרות ב-Supabase Storage</span></div>}
                </div>
              </div>
              {/* Inventory table */}
              <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/60 flex-row-reverse">
                  <div className="flex items-center gap-2 flex-row-reverse"><Car className="w-4 h-4 text-red-600"/><h3 className="font-bold text-white text-sm">המלאי הנוכחי</h3></div>
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded-full">{inventory.length} רכבים</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-xs">
                      <tr><th className="px-3 py-3 text-center">פעולות</th><th className="px-3 py-3">מחיר</th><th className="px-3 py-3">מצב</th><th className="px-3 py-3">רכב</th><th className="px-3 py-3">פרטים</th><th className="px-3 py-3">תמונה</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {inventory.map(car=>(
                        <tr key={car.id} className="hover:bg-neutral-900/40">
                          <td className="px-3 py-3">
                            <div className="flex gap-1.5 justify-center">
                              <button onClick={()=>setEditCar({...car})} className="p-1.5 bg-neutral-800 hover:bg-blue-600 text-neutral-400 hover:text-white rounded-lg transition-colors" title="עריכה">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={()=>setDeleteConfirmId(car.id)} className="p-1.5 bg-neutral-800 hover:bg-red-600 text-neutral-400 hover:text-white rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                          </td>
                          <td className="px-3 py-3"><span className="text-red-500 font-bold text-sm">₪{car.price}</span>{car.monthlyPayment&&<div className="text-xs text-neutral-500">₪{car.monthlyPayment}/ח'</div>}</td>
                          <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${car.condition==='חדש'?'bg-red-600/20 text-red-400 border border-red-600/30':'bg-neutral-700/60 text-neutral-300 border border-neutral-600/30'}`}>{car.condition}</span></td>
                          <td className="px-3 py-3"><div className="font-bold text-white text-sm">{car.make} {car.model}</div><div className="text-xs text-neutral-500">{car.subModel}</div></td>
                          <td className="px-3 py-3 text-xs text-neutral-400"><div>{car.year} | יד {car.owners}</div><div>{car.engineType}</div></td>
                          <td className="px-3 py-3"><img src={car.image||'/back.jpg'} alt={car.model} className="w-16 h-10 object-cover rounded-lg border border-neutral-700 ml-auto" onError={e=>e.target.src='/back.jpg'}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventory.length===0&&<div className="py-12 text-center text-neutral-500 text-sm"><Car className="w-10 h-10 mx-auto mb-3 opacity-30"/><p>המלאי ריק — הוסף רכב ראשון 👆</p></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-red-600/40 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/30"><Trash2 className="w-7 h-7 text-red-500"/></div>
            <h3 className="text-xl font-bold text-white mb-2">מחיקת רכב</h3>
            <p className="text-neutral-400 text-sm mb-6">האם אתה בטוח? פעולה זו בלתי הפיכה.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteConfirmId(null)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium">ביטול</button>
              <button onClick={()=>handleDeleteCar(deleteConfirmId)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold">מחק</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCar && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex-row-reverse shrink-0">
              <button onClick={()=>{setEditCar(null);setEditStatus('idle');setEditSelectedFiles([]);}} className="bg-neutral-800 hover:bg-red-600 p-2 rounded-full text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              <div className="text-right">
                <h2 className="text-lg font-bold text-white">עריכת רכב</h2>
                <p className="text-xs text-neutral-500">{editCar.make} {editCar.model} ({editCar.year})</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleEditSave} className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {editCar.image && (
                  <div className="col-span-2 md:col-span-3 mb-2">
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-neutral-700">
                      <img src={editCar.image} className="w-full h-full object-cover" onError={e=>e.target.src='/back.jpg'}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3"><span className="text-xs text-white/70">תמונה ראשית נוכחית</span></div>
                    </div>
                  </div>
                )}
                <select required value={editCar.make} onChange={e=>setEditCar({...editCar,make:e.target.value})} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-blue-500 outline-none col-span-2 md:col-span-1">
                  <option value="">יצרן</option>{ISRAELI_CAR_MAKES.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                {[
                  {ph:'דגם',k:'model',req:true},{ph:'תת דגם',k:'subModel'},{ph:'שנתון',k:'year',t:'number',req:true},
                  {ph:'קילומטראז\'',k:'mileage'},{ph:'יד הרכב',k:'owners',t:'number'},{ph:'נפח מנוע סמ"ק',k:'engineCapacity'},
                  {ph:'מחיר ₪',k:'price',req:true},{ph:'החזר חודשי ₪',k:'monthlyPayment'},
                ].map(f=>(
                  <input key={f.k} required={!!f.req} type={f.t||'text'} placeholder={f.ph} value={editCar[f.k]||''} onChange={e=>setEditCar({...editCar,[f.k]:e.target.value})} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-blue-500 outline-none"/>
                ))}
                <select value={editCar.condition} onChange={e=>setEditCar({...editCar,condition:e.target.value})} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-blue-500 outline-none">
                  <option value="משומש">משומש</option><option value="חדש">חדש</option>
                </select>
                <select value={editCar.engineType} onChange={e=>setEditCar({...editCar,engineType:e.target.value})} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-blue-500 outline-none">
                  {['בנזין','הייבריד','חשמלי','דיזל','פלאג אין הייבריד'].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <select value={editCar.type||'משפחתי'} onChange={e=>setEditCar({...editCar,type:e.target.value})} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-right focus:border-blue-500 outline-none">
                  {['משפחתי','יוקרה','ספורט','SUV'].map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <div className="col-span-2 md:col-span-3 flex items-center gap-4 flex-row-reverse bg-neutral-800/50 p-2 rounded-xl border border-neutral-700">
  <div className="flex-1 flex items-center gap-2 flex-row-reverse">
    <input type="text" placeholder="מחיר מחירון" value={editCar.listPrice||''} onChange={e=>setEditCar({...editCar,listPrice:e.target.value})} disabled={!editCar.showListPrice} className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white disabled:opacity-40 text-right outline-none"/>
    <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer whitespace-nowrap flex-row-reverse">
      <input type="checkbox" checked={!!editCar.showListPrice} onChange={e=>setEditCar({...editCar,showListPrice:e.target.checked})} className="accent-red-600 w-4 h-4"/>הצג מחירון
    </label>
  </div>
  <label className="flex items-center gap-2 text-sm text-white font-bold cursor-pointer whitespace-nowrap flex-row-reverse bg-blue-600/20 px-4 py-2.5 rounded-lg border border-blue-600/40 hover:bg-blue-600/30 transition-colors">
    <input type="checkbox" checked={!!editCar.showOnHome} onChange={e=>setEditCar({...editCar,showOnHome:e.target.checked})} className="accent-blue-600 w-4 h-4"/>
    הצג בדף הבית
  </label>
</div>
                
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-xs text-neutral-400 mb-1.5">החלפת תמונות (אופציונלי - עד 10 תמונות)</label>
                  <input type="file" accept="image/*" multiple onChange={e=>handleImageSelection(e,'edit')} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs file:ml-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-600 file:text-white cursor-pointer"/>
                  {editSelectedFiles.length>0 && <p className="text-xs text-blue-400 mt-1">✓ {editSelectedFiles.length} תמונות נבחרו ויחליפו את הישנות</p>}
                </div>

                <div className="col-span-2 md:col-span-3 flex gap-3 flex-row-reverse mt-2">
                  <button type="submit" disabled={editStatus==='loading'} className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 flex-row-reverse transition-all text-white ${editStatus==='loading'?'bg-neutral-700 cursor-not-allowed':editStatus==='success'?'bg-green-600':'bg-blue-600 hover:bg-blue-500'}`}>
                    {editStatus==='loading'?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>שומר...</>:editStatus==='success'?<><Check className="w-5 h-5"/>נשמר בהצלחה!</>:<>שמור שינויים <Check className="w-5 h-5"/></>}
                  </button>
                  <button type="button" onClick={()=>{setEditCar(null);setEditStatus('idle');setEditSelectedFiles([]);}} className="px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium">ביטול</button>
                </div>
                {editStatus==='error'&&<div className="col-span-2 md:col-span-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex-row-reverse"><X className="w-4 h-4"/><span className="text-sm">שגיאה בשמירה — נסה שוב</span></div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default CarDealershipApp;