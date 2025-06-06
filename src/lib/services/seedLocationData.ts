
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/schema";

// Seed location data for Turkey
export const seedLocationData = async () => {
  try {
    console.log("Lokasyon verilerini yükleme başlıyor...");
    
    // Check if cities already exist
    const citiesCollection = collection(db, "cities");
    const citySnapshot = await getDocs(citiesCollection);
    
    if (citySnapshot.size > 0) {
      console.log("Lokasyon verileri zaten mevcut. Yükleme atlanıyor.");
      return;
    }
    
    // All Turkish Cities
    const cities = [
      { id: "adana", name: "Adana" },
      { id: "adiyaman", name: "Adıyaman" },
      { id: "afyonkarahisar", name: "Afyonkarahisar" },
      { id: "agri", name: "Ağrı" },
      { id: "aksaray", name: "Aksaray" },
      { id: "amasya", name: "Amasya" },
      { id: "ankara", name: "Ankara" },
      { id: "antalya", name: "Antalya" },
      { id: "ardahan", name: "Ardahan" },
      { id: "artvin", name: "Artvin" },
      { id: "aydin", name: "Aydın" },
      { id: "balikesir", name: "Balıkesir" },
      { id: "bartin", name: "Bartın" },
      { id: "batman", name: "Batman" },
      { id: "bayburt", name: "Bayburt" },
      { id: "bilecik", name: "Bilecik" },
      { id: "bingol", name: "Bingöl" },
      { id: "bitlis", name: "Bitlis" },
      { id: "bolu", name: "Bolu" },
      { id: "burdur", name: "Burdur" },
      { id: "bursa", name: "Bursa" },
      { id: "canakkale", name: "Çanakkale" },
      { id: "cankiri", name: "Çankırı" },
      { id: "corum", name: "Çorum" },
      { id: "denizli", name: "Denizli" },
      { id: "diyarbakir", name: "Diyarbakır" },
      { id: "duzce", name: "Düzce" },
      { id: "edirne", name: "Edirne" },
      { id: "elazig", name: "Elazığ" },
      { id: "erzincan", name: "Erzincan" },
      { id: "erzurum", name: "Erzurum" },
      { id: "eskisehir", name: "Eskişehir" },
      { id: "gaziantep", name: "Gaziantep" },
      { id: "giresun", name: "Giresun" },
      { id: "gumushane", name: "Gümüşhane" },
      { id: "hakkari", name: "Hakkari" },
      { id: "hatay", name: "Hatay" },
      { id: "igdir", name: "Iğdır" },
      { id: "isparta", name: "Isparta" },
      { id: "istanbul", name: "İstanbul" },
      { id: "izmir", name: "İzmir" },
      { id: "kahramanmaras", name: "Kahramanmaraş" },
      { id: "karabuk", name: "Karabük" },
      { id: "karaman", name: "Karaman" },
      { id: "kars", name: "Kars" },
      { id: "kastamonu", name: "Kastamonu" },
      { id: "kayseri", name: "Kayseri" },
      { id: "kilis", name: "Kilis" },
      { id: "kirikkale", name: "Kırıkkale" },
      { id: "kirklareli", name: "Kırklareli" },
      { id: "kirsehir", name: "Kırşehir" },
      { id: "kocaeli", name: "Kocaeli" },
      { id: "konya", name: "Konya" },
      { id: "kutahya", name: "Kütahya" },
      { id: "malatya", name: "Malatya" },
      { id: "manisa", name: "Manisa" },
      { id: "mardin", name: "Mardin" },
      { id: "mersin", name: "Mersin" },
      { id: "mugla", name: "Muğla" },
      { id: "mus", name: "Muş" },
      { id: "nevsehir", name: "Nevşehir" },
      { id: "nigde", name: "Niğde" },
      { id: "ordu", name: "Ordu" },
      { id: "osmaniye", name: "Osmaniye" },
      { id: "rize", name: "Rize" },
      { id: "sakarya", name: "Sakarya" },
      { id: "samsun", name: "Samsun" },
      { id: "sanliurfa", name: "Şanlıurfa" },
      { id: "siirt", name: "Siirt" },
      { id: "sinop", name: "Sinop" },
      { id: "sivas", name: "Sivas" },
      { id: "sirnak", name: "Şırnak" },
      { id: "tekirdag", name: "Tekirdağ" },
      { id: "tokat", name: "Tokat" },
      { id: "trabzon", name: "Trabzon" },
      { id: "tunceli", name: "Tunceli" },
      { id: "usak", name: "Uşak" },
      { id: "van", name: "Van" },
      { id: "yalova", name: "Yalova" },
      { id: "yozgat", name: "Yozgat" },
      { id: "zonguldak", name: "Zonguldak" }
    ];
    
    // Major districts from these cities
    const districts = [
      // İstanbul
      { id: "kadikoy", name: "Kadıköy", cityId: "istanbul" },
      { id: "besiktas", name: "Beşiktaş", cityId: "istanbul" },
      { id: "sisli", name: "Şişli", cityId: "istanbul" },
      { id: "uskudar", name: "Üsküdar", cityId: "istanbul" },
      { id: "fatih", name: "Fatih", cityId: "istanbul" },
      { id: "beyoglu", name: "Beyoğlu", cityId: "istanbul" },
      { id: "maltepe", name: "Maltepe", cityId: "istanbul" },
      { id: "bakirkoy", name: "Bakırköy", cityId: "istanbul" },
      { id: "atasehir", name: "Ataşehir", cityId: "istanbul" },
      { id: "umraniye", name: "Ümraniye", cityId: "istanbul" },
      { id: "pendik", name: "Pendik", cityId: "istanbul" },
      { id: "kartal", name: "Kartal", cityId: "istanbul" },
      { id: "sariyer", name: "Sarıyer", cityId: "istanbul" },
      { id: "bahcelievler", name: "Bahçelievler", cityId: "istanbul" },
      { id: "beylikduzu", name: "Beylikdüzü", cityId: "istanbul" },
      { id: "esenyurt", name: "Esenyurt", cityId: "istanbul" },
      
      // Ankara
      { id: "cankaya", name: "Çankaya", cityId: "ankara" },
      { id: "kecioren", name: "Keçiören", cityId: "ankara" },
      { id: "mamak", name: "Mamak", cityId: "ankara" },
      { id: "yenimahalle", name: "Yenimahalle", cityId: "ankara" },
      { id: "etimesgut", name: "Etimesgut", cityId: "ankara" },
      { id: "sincan", name: "Sincan", cityId: "ankara" },
      { id: "altindag", name: "Altındağ", cityId: "ankara" },
      { id: "pursaklar", name: "Pursaklar", cityId: "ankara" },
      
      // İzmir
      { id: "konak", name: "Konak", cityId: "izmir" },
      { id: "karsiyaka", name: "Karşıyaka", cityId: "izmir" },
      { id: "bornova", name: "Bornova", cityId: "izmir" },
      { id: "buca", name: "Buca", cityId: "izmir" },
      { id: "cigli", name: "Çiğli", cityId: "izmir" },
      { id: "bayrakli", name: "Bayraklı", cityId: "izmir" },
      { id: "gaziemir", name: "Gaziemir", cityId: "izmir" },
      { id: "karsiyaka", name: "Karşıyaka", cityId: "izmir" },
      
      // Antalya
      { id: "muratpasa", name: "Muratpaşa", cityId: "antalya" },
      { id: "konyaalti", name: "Konyaaltı", cityId: "antalya" },
      { id: "kepez", name: "Kepez", cityId: "antalya" },
      { id: "alanya", name: "Alanya", cityId: "antalya" },
      { id: "manavgat", name: "Manavgat", cityId: "antalya" },
      { id: "serik", name: "Serik", cityId: "antalya" },
      
      // Bursa
      { id: "nilufer", name: "Nilüfer", cityId: "bursa" },
      { id: "osmangazi", name: "Osmangazi", cityId: "bursa" },
      { id: "yildirim", name: "Yıldırım", cityId: "bursa" },
      { id: "gemlik", name: "Gemlik", cityId: "bursa" },
      { id: "mudanya", name: "Mudanya", cityId: "bursa" },
      
      // Add more main districts from other cities
      { id: "seyhan", name: "Seyhan", cityId: "adana" },
      { id: "cukurova", name: "Çukurova", cityId: "adana" },
      { id: "sahinbey", name: "Şahinbey", cityId: "gaziantep" },
      { id: "selcuklu", name: "Selçuklu", cityId: "konya" },
      { id: "mezitli", name: "Mezitli", cityId: "mersin" },
      { id: "baglar", name: "Bağlar", cityId: "diyarbakir" },
      { id: "melikgazi", name: "Melikgazi", cityId: "kayseri" },
      { id: "odunpazari", name: "Odunpazarı", cityId: "eskisehir" },
      { id: "atakum", name: "Atakum", cityId: "samsun" },
      { id: "pamukkale", name: "Pamukkale", cityId: "denizli" },
      { id: "ortahisar", name: "Ortahisar", cityId: "trabzon" }
    ];
    
    // Sample neighborhoods (focusing on major districts)
    const neighborhoods = [
      // İstanbul - Kadıköy
      { id: "caferaga", name: "Caferağa", districtId: "kadikoy" },
      { id: "goztepe", name: "Göztepe", districtId: "kadikoy" },
      { id: "fenerbahce", name: "Fenerbahçe", districtId: "kadikoy" },
      { id: "moda", name: "Moda", districtId: "kadikoy" },
      { id: "caddebostan", name: "Caddebostan", districtId: "kadikoy" },
      { id: "erenkoy", name: "Erenköy", districtId: "kadikoy" },
      { id: "suadiye", name: "Suadiye", districtId: "kadikoy" },
      { id: "kozyatagi", name: "Kozyatağı", districtId: "kadikoy" },
      
      // İstanbul - Beşiktaş
      { id: "levent", name: "Levent", districtId: "besiktas" },
      { id: "etiler", name: "Etiler", districtId: "besiktas" },
      { id: "ortakoy", name: "Ortaköy", districtId: "besiktas" },
      { id: "bebek", name: "Bebek", districtId: "besiktas" },
      { id: "arnavutkoy", name: "Arnavutköy", districtId: "besiktas" },
      { id: "besiktas_merkez", name: "Beşiktaş Merkez", districtId: "besiktas" },
      
      // İstanbul - Şişli
      { id: "mecidiyekoy", name: "Mecidiyeköy", districtId: "sisli" },
      { id: "nisantasi", name: "Nişantaşı", districtId: "sisli" },
      { id: "fulya", name: "Fulya", districtId: "sisli" },
      { id: "bomonti", name: "Bomonti", districtId: "sisli" },
      { id: "harbiye", name: "Harbiye", districtId: "sisli" },
      { id: "tesvikiye", name: "Teşvikiye", districtId: "sisli" },
      
      // İstanbul - Üsküdar
      { id: "beylerbeyi", name: "Beylerbeyi", districtId: "uskudar" },
      { id: "kuzguncuk", name: "Kuzguncuk", districtId: "uskudar" },
      { id: "acibadem", name: "Acıbadem", districtId: "uskudar" },
      { id: "bulgurlu", name: "Bulgurlu", districtId: "uskudar" },
      { id: "cengelkoy", name: "Çengelköy", districtId: "uskudar" },
      { id: "valide_atik", name: "Valide-i Atik", districtId: "uskudar" },
      
      // Ankara - Çankaya
      { id: "kizilay", name: "Kızılay", districtId: "cankaya" },
      { id: "bahcelievler_ank", name: "Bahçelievler", districtId: "cankaya" },
      { id: "cebeci", name: "Cebeci", districtId: "cankaya" },
      { id: "cukurambar", name: "Çukurambar", districtId: "cankaya" },
      { id: "gaziosmanpasa", name: "Gaziosmanpaşa", districtId: "cankaya" },
      { id: "kocatepe", name: "Kocatepe", districtId: "cankaya" },
      { id: "dikmen", name: "Dikmen", districtId: "cankaya" },
      
      // Ankara - Keçiören
      { id: "etlik", name: "Etlik", districtId: "kecioren" },
      { id: "incirli", name: "İncirli", districtId: "kecioren" },
      { id: "kalaba", name: "Kalaba", districtId: "kecioren" },
      { id: "ovacik", name: "Ovacık", districtId: "kecioren" },
      { id: "kusgulu", name: "Kuşgülü", districtId: "kecioren" },
      
      // Ankara - Mamak
      { id: "bogazici", name: "Boğaziçi", districtId: "mamak" },
      { id: "dutluk", name: "Dutluk", districtId: "mamak" },
      { id: "abidinpasa", name: "Abidinpaşa", districtId: "mamak" },
      { id: "akcagiz", name: "Akçağız", districtId: "mamak" },
      
      // İzmir - Konak
      { id: "alsancak", name: "Alsancak", districtId: "konak" },
      { id: "goztepe_izmir", name: "Göztepe", districtId: "konak" },
      { id: "hatay", name: "Hatay", districtId: "konak" },
      { id: "konak_merkez", name: "Konak Merkez", districtId: "konak" },
      { id: "gundogdu", name: "Gündoğdu", districtId: "konak" },
      
      // İzmir - Karşıyaka
      { id: "bostanli", name: "Bostanlı", districtId: "karsiyaka" },
      { id: "atakent", name: "Atakent", districtId: "karsiyaka" },
      { id: "mavisehir", name: "Mavişehir", districtId: "karsiyaka" },
      { id: "tersane", name: "Tersane", districtId: "karsiyaka" },
      
      // İzmir - Bornova
      { id: "evka", name: "Evka", districtId: "bornova" },
      { id: "erzene", name: "Erzene", districtId: "bornova" },
      { id: "kazimdirik", name: "Kazımdirik", districtId: "bornova" },
      { id: "inonu", name: "İnönü", districtId: "bornova" },
      
      // Antalya - Muratpaşa
      { id: "konyaalti_mahallesi", name: "Konyaaltı Mahallesi", districtId: "muratpasa" },
      { id: "lara", name: "Lara", districtId: "muratpasa" },
      { id: "memurevleri", name: "Memurevleri", districtId: "muratpasa" },
      { id: "fener", name: "Fener", districtId: "muratpasa" },
      
      // Antalya - Konyaaltı
      { id: "hurma", name: "Hurma", districtId: "konyaalti" },
      { id: "liman", name: "Liman", districtId: "konyaalti" },
      { id: "sarisu", name: "Sarısu", districtId: "konyaalti" },
      { id: "arapsuyu", name: "Arapsuyu", districtId: "konyaalti" },
      
      // Bursa - Nilüfer
      { id: "ihsaniye", name: "İhsaniye", districtId: "nilufer" },
      { id: "gorukle", name: "Görükle", districtId: "nilufer" },
      { id: "besevler", name: "Beşevler", districtId: "nilufer" },
      { id: "fsm", name: "FSM", districtId: "nilufer" },
      
      // Bursa - Osmangazi
      { id: "hamitler", name: "Hamitler", districtId: "osmangazi" },
      { id: "demirkapi", name: "Demirkapı", districtId: "osmangazi" },
      { id: "heykel", name: "Heykel", districtId: "osmangazi" },
      { id: "cekirge", name: "Çekirge", districtId: "osmangazi" }
    ];
    
    // Cities
    for (const city of cities) {
      await setDoc(doc(db, "cities", city.id), city);
    }
    
    // Districts
    for (const district of districts) {
      await setDoc(doc(db, "districts", district.id), district);
    }
    
    // Neighborhoods
    for (const neighborhood of neighborhoods) {
      await setDoc(doc(db, "neighborhoods", neighborhood.id), neighborhood);
    }
    
    console.log("Lokasyon verileri başarıyla yüklendi!");
  } catch (error) {
    console.error("Lokasyon verilerini yükleme hatası:", error);
    throw error; // Re-throw the error so that the parent function can catch it
  }
};

// Seed comprehensive sample shops with proper location data
export const seedSampleShops = async () => {
  try {
    console.log("Örnek işletmeleri yükleme başlıyor...");
    
    // Check if shops already exist
    const shopsCollection = collection(db, COLLECTIONS.SHOPS);
    const q = query(shopsCollection, where("isSample", "==", true));
    const shopsSnapshot = await getDocs(q);
    
    if (shopsSnapshot.size > 0) {
      console.log("Örnek işletmeler zaten mevcut. Yükleme atlanıyor.");
      return;
    }
    
    const sampleShops = [
      {
        name: "Seyfi Erkek Kuaförü",
        category: "Berber",
        description: "Kaliteli hizmet, uygun fiyat",
        rating: { average: 4.8, count: 125 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 2,
        popularityScore: 95,
        location: {
          city: "İstanbul",
          district: "Kadıköy",
          neighborhood: "Caferağa",
          address: "Moda Caddesi No:14"
        },
        contact: {
          phone: "+905551234567",
          email: "seyfi.kuafor@example.com",
          website: "https://example.com/seyfi"
        }
      },
      {
        name: "Style Saç Tasarım",
        category: "Kuaför",
        description: "Modern kesimler ve profesyonel saç bakımı",
        rating: { average: 4.7, count: 89 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 3,
        popularityScore: 92,
        location: {
          city: "İstanbul",
          district: "Beşiktaş",
          neighborhood: "Levent",
          address: "Levent Caddesi No:112"
        },
        contact: {
          phone: "+905559876543",
          email: "style.sac@example.com",
          website: "https://example.com/style"
        }
      },
      {
        name: "Nail Art Studio",
        category: "Güzellik Merkezi",
        description: "Profesyonel tırnak bakımı ve tasarımı",
        rating: { average: 4.5, count: 78 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: false,
        isActive: true,
        isSample: true,
        priceLevel: 2,
        popularityScore: 85,
        location: {
          city: "Ankara",
          district: "Çankaya",
          neighborhood: "Kızılay",
          address: "Kızılay Meydanı No:5"
        },
        contact: {
          phone: "+905551112233",
          email: "nail.art@example.com"
        }
      },
      {
        name: "Güzellik Merkezi",
        category: "Güzellik Merkezi",
        description: "Profesyonel makyaj ve cilt bakımı hizmetleri",
        rating: { average: 4.6, count: 65 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 3,
        popularityScore: 88,
        location: {
          city: "İzmir",
          district: "Konak",
          neighborhood: "Alsancak",
          address: "Kordon Boyu No:123"
        },
        contact: {
          phone: "+905554443322",
          email: "guzellik.merkezi@example.com",
          website: "https://example.com/guzellik"
        }
      },
      {
        name: "Dermis Skincare",
        category: "Güzellik Merkezi",
        description: "Uzman kadromuzla cildinize özel bakım",
        rating: { average: 4.9, count: 112 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 3,
        popularityScore: 97,
        location: {
          city: "İstanbul",
          district: "Şişli",
          neighborhood: "Nişantaşı",
          address: "Abdi İpekçi Caddesi No:42"
        },
        contact: {
          phone: "+905556667788",
          email: "dermis@example.com",
          website: "https://example.com/dermis"
        }
      },
      {
        name: "Relax Masaj",
        category: "Masaj Salonu",
        description: "Yorgunluğunuzu alıyoruz",
        rating: { average: 4.7, count: 91 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: false,
        isActive: true,
        isSample: true,
        priceLevel: 2,
        popularityScore: 90,
        location: {
          city: "Antalya",
          district: "Muratpaşa",
          neighborhood: "Lara",
          address: "Lara Sahil Yolu No:76"
        },
        contact: {
          phone: "+905557778899",
          email: "relax.masaj@example.com"
        }
      },
      {
        name: "Fast Trim",
        category: "Berber",
        description: "Hızlı ve kaliteli erkek saç kesimi",
        rating: { average: 4.3, count: 57 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: false,
        isActive: true,
        isSample: true,
        priceLevel: 1,
        popularityScore: 82,
        location: {
          city: "İstanbul",
          district: "Üsküdar",
          neighborhood: "Beylerbeyi",
          address: "Beylerbeyi Caddesi No:18"
        },
        contact: {
          phone: "+905553332211",
          email: "fast.trim@example.com"
        }
      },
      {
        name: "Color Hair Studio",
        category: "Kuaför",
        description: "Renkli saçlar için profesyonel hizmet",
        rating: { average: 4.6, count: 85 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 3,
        popularityScore: 89,
        location: {
          city: "Bursa",
          district: "Nilüfer",
          neighborhood: "İhsaniye",
          address: "İhsaniye Mahallesi No:33"
        },
        contact: {
          phone: "+905559991122",
          email: "color.hair@example.com",
          website: "https://example.com/colorhair"
        }
      },
      {
        name: "Elite Spa & Wellness",
        category: "Spa",
        description: "Lüks spa deneyimi",
        rating: { average: 4.9, count: 120 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 4,
        popularityScore: 96,
        location: {
          city: "İstanbul",
          district: "Beşiktaş",
          neighborhood: "Etiler",
          address: "Nispetiye Caddesi No:64"
        },
        contact: {
          phone: "+905559876543",
          email: "elite.spa@example.com",
          website: "https://example.com/elitespa"
        }
      },
      {
        name: "ModernLine Estetik",
        category: "Estetik Merkezi",
        description: "Yenilikçi estetik uygulamalar",
        rating: { average: 4.7, count: 68 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 4,
        popularityScore: 91,
        location: {
          city: "İzmir",
          district: "Karşıyaka",
          neighborhood: "Bostanlı",
          address: "Cemal Gürsel Caddesi No:412"
        },
        contact: {
          phone: "+905551122334",
          email: "modernline@example.com",
          website: "https://example.com/modernline"
        }
      },
      {
        name: "Golden Touch Massage",
        category: "Masaj Salonu",
        description: "Profesyonel masaj terapisi",
        rating: { average: 4.8, count: 93 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: true,
        isActive: true,
        isSample: true,
        priceLevel: 3,
        popularityScore: 93,
        location: {
          city: "Ankara",
          district: "Çankaya",
          neighborhood: "Gaziosmanpaşa",
          address: "Kuleli Sokak No:17"
        },
        contact: {
          phone: "+905553344556",
          email: "golden.touch@example.com",
          website: "https://example.com/goldentouch"
        }
      },
      {
        name: "SunShine Güzellik",
        category: "Güzellik Merkezi",
        description: "Tüm güzellik ihtiyaçlarınız için",
        rating: { average: 4.4, count: 72 },
        image: "/placeholder.svg",
        imageUrl: "/placeholder.svg",
        isPremium: false,
        isActive: true,
        isSample: true,
        priceLevel: 2,
        popularityScore: 86,
        location: {
          city: "Bursa",
          district: "Osmangazi",
          neighborhood: "Heykel",
          address: "Atatürk Caddesi No:24"
        },
        contact: {
          phone: "+905556677889",
          email: "sunshine@example.com"
        }
      }
    ];
    
    // Add sample shops to Firestore
    for (let i = 0; i < sampleShops.length; i++) {
      const shop = sampleShops[i];
      await setDoc(doc(db, COLLECTIONS.SHOPS, `sample-shop-${i+1}`), {
        ...shop,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log("Örnek işletmeler başarıyla yüklendi!");
  } catch (error) {
    console.error("Örnek işletme yükleme hatası:", error);
    throw error; // Re-throw the error so that the parent function can catch it
  }
};
