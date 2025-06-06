import { v4 as uuidv4 } from 'uuid';

// Test işletmeleri için fotoğrafları
const shopImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1470259078422-826894b933aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

// Helpers
const randomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomRating = () => {
  return {
    average: Number((3 + Math.random() * 2).toFixed(1)), // 3.0 - 5.0
    count: Math.floor(5 + Math.random() * 95) // 5-100
  };
};

const randomCityData = () => {
  const cities = [
    { city: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar'] },
    { city: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Mamak', 'Etimesgut', 'Yenimahalle'] },
    { city: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli'] },
    { city: 'Antalya', districts: ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Döşemealtı', 'Aksu'] },
    { city: 'Bursa', districts: ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya', 'Gemlik'] },
  ];
  
  const cityIndex = Math.floor(Math.random() * cities.length);
  const city = cities[cityIndex];
  const district = city.districts[Math.floor(Math.random() * city.districts.length)];
  
  return {
    city: city.city,
    district: district,
    neighborhood: `${district} Mahallesi`,
    address: `${district} ${Math.floor(Math.random() * 1000) + 1}. Sokak No: ${Math.floor(Math.random() * 100) + 1}`
  };
};

// Berber işletmeleri
const generateBerberShops = (count = 10) => {
  const shops = [];
  
  const berberNames = [
    "Efe Berber Salonu",
    "Modern Erkek Kuaförü",
    "Klasik Berber",
    "Usta Berber",
    "Elit Erkek Bakım",
    "Saç & Sakal Ustası",
    "Berber Ahmet",
    "Stil Berber Salonu",
    "Centilmen Berber",
    "Geleneksel Türk Berberi",
    "Özen Berber",
    "Karizmatik Erkek Kuaförü",
    "Tıraş Dünyası",
    "Master Berber",
    "Lüks Erkek Bakım"
  ];
  
  for (let i = 0; i < count; i++) {
    const location = randomCityData();
    const isPremium = Math.random() > 0.7;
    const isPopular = Math.random() > 0.5;
    const rating = isPremium 
      ? { average: Number((4.5 + Math.random() * 0.5).toFixed(1)), count: Math.floor(50 + Math.random() * 150) }
      : randomRating();
    
    const workingHours = {
      pazartesi: { open: '09:00', close: '20:00' },
      salı: { open: '09:00', close: '20:00' },
      çarşamba: { open: '09:00', close: '20:00' },
      perşembe: { open: '09:00', close: '20:00' },
      cuma: { open: '09:00', close: '20:00' },
      cumartesi: { open: '10:00', close: '19:00' },
      pazar: { open: null, close: null },
    };
    
    shops.push({
      id: uuidv4(),
      name: berberNames[i % berberNames.length],
      category: 'Berber',
      subcategory: 'Erkek Kuaför',
      description: 'Erkekler için saç ve sakal bakım hizmetleri sunan kaliteli bir berber.',
      shortDescription: 'Profesyonel saç & sakal tıraşı',
      priceLevel: Math.floor(Math.random() * 3) + 1, // 1-3
      popularity: Math.floor(Math.random() * 100),
      isPopular,
      isPremium,
      isVerified: true,
      rating,
      location: {
        city: location.city,
        district: location.district,
        neighborhood: location.neighborhood,
        address: location.address,
        coordinates: {
          latitude: 41 + Math.random() * 0.5,
          longitude: 29 + Math.random() * 0.5
        }
      },
      workingHours,
      contact: {
        phone: `+90 5${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`.substring(0, 13),
        email: `info@${berberNames[i % berberNames.length].toLowerCase().replace(/\s/g, '')}.com`,
        website: `www.${berberNames[i % berberNames.length].toLowerCase().replace(/\s/g, '')}.com`,
      },
      images: {
        main: shopImages[i % shopImages.length],
        gallery: [
          shopImages[(i + 1) % shopImages.length],
          shopImages[(i + 2) % shopImages.length]
        ]
      }
    });
  }
  
  return shops;
};

// Kuaför işletmeleri
const generateKuaforShops = (count = 10) => {
  const shops = [];
  
  const kuaforNames = [
    "Efsane Kuaför",
    "Zarif Saç Tasarım",
    "Güzellik Merkezi",
    "Stil Kuaför",
    "Modern Saç Sanatı",
    "Şık Kuaför",
    "Elit Kuaför & Güzellik",
    "Bella Saç Tasarım",
    "Glamour Kuaför",
    "İnci Saç Stüdyo",
    "Trend Kuaför",
    "Estetik Saç Tasarım",
    "Prenses Güzellik",
    "Modern Hair Design",
    "Lüks Saç Bakım"
  ];
  
  for (let i = 0; i < count; i++) {
    const location = randomCityData();
    const isPremium = Math.random() > 0.7;
    const isPopular = Math.random() > 0.4;
    const rating = isPremium 
      ? { average: Number((4.5 + Math.random() * 0.5).toFixed(1)), count: Math.floor(50 + Math.random() * 150) }
      : randomRating();
    
    const workingHours = {
      pazartesi: { open: '09:00', close: '19:00' },
      salı: { open: '09:00', close: '19:00' },
      çarşamba: { open: '09:00', close: '19:00' },
      perşembe: { open: '09:00', close: '19:00' },
      cuma: { open: '09:00', close: '19:00' },
      cumartesi: { open: '09:00', close: '18:00' },
      pazar: { open: '10:00', close: '17:00' },
    };
    
    shops.push({
      id: uuidv4(),
      name: kuaforNames[i % kuaforNames.length],
      category: 'Kuaför',
      subcategory: 'Kadın Kuaför',
      description: 'Kadınlar için saç kesimi, boyama ve bakım hizmetleri sunan profesyonel kuaför.',
      shortDescription: 'Profesyonel saç kesim ve bakım',
      priceLevel: Math.floor(Math.random() * 3) + 1, // 1-3
      popularity: Math.floor(Math.random() * 100),
      isPopular,
      isPremium,
      isVerified: true,
      rating,
      location: {
        city: location.city,
        district: location.district,
        neighborhood: location.neighborhood,
        address: location.address,
        coordinates: {
          latitude: 41 + Math.random() * 0.5,
          longitude: 29 + Math.random() * 0.5
        }
      },
      workingHours,
      contact: {
        phone: `+90 5${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`.substring(0, 13),
        email: `info@${kuaforNames[i % kuaforNames.length].toLowerCase().replace(/\s/g, '')}.com`
      },
      images: {
        main: shopImages[i % shopImages.length],
        gallery: [
          shopImages[(i + 3) % shopImages.length],
          shopImages[(i + 4) % shopImages.length]
        ]
      }
    });
  }
  
  return shops;
};

// Güzellik Merkezi işletmeleri
const generateGuzellikMerkeziShops = (count = 10) => {
  const shops = [];
  
  const guzellikMerkeziNames = [
    "Güzellik Atölyesi",
    "Estetik Dünyası",
    "Beauty Center",
    "Güzellik Noktası",
    "Güzellik & Bakım",
    "Elit Güzellik",
    "Lüks Güzellik Salonu",
    "Güzellik Akademisi",
    "Premium Estetik",
    "Mistik Güzellik",
    "Şıklık Merkezi",
    "Zarafet Güzellik",
    "Modern Estetik",
    "Asil Güzellik",
    "Royal Beauty"
  ];
  
  for (let i = 0; i < count; i++) {
    const location = randomCityData();
    const isPremium = Math.random() > 0.6;
    const isPopular = Math.random() > 0.3;
    const rating = isPremium 
      ? { average: Number((4.5 + Math.random() * 0.5).toFixed(1)), count: Math.floor(50 + Math.random() * 150) }
      : randomRating();
    
    const workingHours = {
      pazartesi: { open: '10:00', close: '20:00' },
      salı: { open: '10:00', close: '20:00' },
      çarşamba: { open: '10:00', close: '20:00' },
      perşembe: { open: '10:00', close: '20:00' },
      cuma: { open: '10:00', close: '20:00' },
      cumartesi: { open: '10:00', close: '19:00' },
      pazar: { open: '10:00', close: '18:00' },
    };
    
    shops.push({
      id: uuidv4(),
      name: guzellikMerkeziNames[i % guzellikMerkeziNames.length],
      category: 'Güzellik Merkezi',
      subcategory: 'Estetik Merkezi',
      description: 'Cilt bakımı, makyaj ve çeşitli bakım hizmetleri sunan profesyonel güzellik merkezi.',
      shortDescription: 'Profesyonel cilt bakımı ve güzellik hizmetleri',
      priceLevel: Math.floor(Math.random() * 3) + 2, // 2-3
      popularity: Math.floor(Math.random() * 100),
      isPopular,
      isPremium,
      isVerified: true,
      rating,
      location: {
        city: location.city,
        district: location.district,
        neighborhood: location.neighborhood,
        address: location.address,
        coordinates: {
          latitude: 41 + Math.random() * 0.5,
          longitude: 29 + Math.random() * 0.5
        }
      },
      workingHours,
      contact: {
        phone: `+90 5${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`.substring(0, 13),
        email: `info@${guzellikMerkeziNames[i % guzellikMerkeziNames.length].toLowerCase().replace(/\s/g, '')}.com`
      },
      images: {
        main: shopImages[(i + 5) % shopImages.length],
        gallery: [
          shopImages[(i + 6) % shopImages.length],
          shopImages[(i + 7) % shopImages.length]
        ]
      }
    });
  }
  
  return shops;
};

// Spa işletmeleri
const generateSpaShops = (count = 10) => {
  const shops = [];
  
  const spaNames = [
    "Zen Spa & Wellness",
    "Huzur Spa Merkezi",
    "Relax Spa House",
    "Serenity Spa",
    "Lüks SPA Keyfi",
    "Wellness Center",
    "Spa & Masaj Merkezi",
    "Terapi SPA",
    "Rahatla Spa",
    "Ferah SPA",
    "Enerji Spa",
    "Asya Spa",
    "Elements Spa",
    "Mistik Spa",
    "Royal Spa"
  ];
  
  for (let i = 0; i < count; i++) {
    const location = randomCityData();
    const isPremium = Math.random() > 0.5;
    const isPopular = Math.random() > 0.3;
    const rating = isPremium 
      ? { average: Number((4.5 + Math.random() * 0.5).toFixed(1)), count: Math.floor(50 + Math.random() * 150) }
      : randomRating();
    
    const workingHours = {
      pazartesi: { open: '10:00', close: '21:00' },
      salı: { open: '10:00', close: '21:00' },
      çarşamba: { open: '10:00', close: '21:00' },
      perşembe: { open: '10:00', close: '21:00' },
      cuma: { open: '10:00', close: '22:00' },
      cumartesi: { open: '10:00', close: '22:00' },
      pazar: { open: '11:00', close: '19:00' },
    };
    
    shops.push({
      id: uuidv4(),
      name: spaNames[i % spaNames.length],
      category: 'Spa',
      subcategory: 'Masaj Salonu',
      description: 'Masaj, cilt bakımı ve vücut terapileri sunan rahatlatıcı spa merkezi.',
      shortDescription: 'Rahatlatıcı masaj ve spa terapileri',
      priceLevel: Math.floor(Math.random() * 2) + 2, // 2-3
      popularity: Math.floor(Math.random() * 100),
      isPopular,
      isPremium,
      isVerified: true,
      rating,
      location: {
        city: location.city,
        district: location.district,
        neighborhood: location.neighborhood,
        address: location.address,
        coordinates: {
          latitude: 41 + Math.random() * 0.5,
          longitude: 29 + Math.random() * 0.5
        }
      },
      workingHours,
      contact: {
        phone: `+90 5${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`.substring(0, 13),
        email: `info@${spaNames[i % spaNames.length].toLowerCase().replace(/\s/g, '')}.com`
      },
      images: {
        main: shopImages[(i + 8) % shopImages.length],
        gallery: [
          shopImages[(i + 0) % shopImages.length],
          shopImages[(i + 1) % shopImages.length]
        ]
      }
    });
  }
  
  return shops;
};

// Tırnak Bakımı işletmeleri
const generateTirnakShops = (count = 10) => {
  const shops = [];
  
  const tirnakNames = [
    "Nail Art Studio",
    "Pro Nail Design",
    "Güzel Tırnaklar",
    "Nail House",
    "Perfect Nail",
    "Oje Dünyası",
    "Şık Tırnaklar",
    "Tırnak Tasarım",
    "Nail Expert",
    "Pretty Nails",
    "Tırnak Stüdyo",
    "Zarif Tırnaklar",
    "Nail Bar",
    "Tırnak Sanatı",
    "Güzellik & Tırnak"
  ];
  
  for (let i = 0; i < count; i++) {
    const location = randomCityData();
    const isPremium = Math.random() > 0.7;
    const isPopular = Math.random() > 0.5;
    const rating = isPremium 
      ? { average: Number((4.5 + Math.random() * 0.5).toFixed(1)), count: Math.floor(50 + Math.random() * 150) }
      : randomRating();
    
    const workingHours = {
      pazartesi: { open: '10:00', close: '19:00' },
      salı: { open: '10:00', close: '19:00' },
      çarşamba: { open: '10:00', close: '19:00' },
      perşembe: { open: '10:00', close: '19:00' },
      cuma: { open: '10:00', close: '20:00' },
      cumartesi: { open: '10:00', close: '20:00' },
      pazar: { open: '12:00', close: '18:00' },
    };
    
    shops.push({
      id: uuidv4(),
      name: tirnakNames[i % tirnakNames.length],
      category: 'Tırnak Bakımı',
      subcategory: 'Manikür & Pedikür',
      description: 'Manikür, pedikür ve tırnak tasarımı hizmetleri sunan profesyonel tırnak bakım salonu.',
      shortDescription: 'Profesyonel manikür, pedikür ve tırnak tasarımı',
      priceLevel: Math.floor(Math.random() * 3) + 1, // 1-3
      popularity: Math.floor(Math.random() * 100),
      isPopular,
      isPremium,
      isVerified: true,
      rating,
      location: {
        city: location.city,
        district: location.district,
        neighborhood: location.neighborhood,
        address: location.address,
        coordinates: {
          latitude: 41 + Math.random() * 0.5,
          longitude: 29 + Math.random() * 0.5
        }
      },
      workingHours,
      contact: {
        phone: `+90 5${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`.substring(0, 13),
        email: `info@${tirnakNames[i % tirnakNames.length].toLowerCase().replace(/\s/g, '')}.com`
      },
      images: {
        main: shopImages[(i + 2) % shopImages.length],
        gallery: [
          shopImages[(i + 3) % shopImages.length],
          shopImages[(i + 4) % shopImages.length]
        ]
      }
    });
  }
  
  return shops;
};

// Ana kategorilerdeki işletmeleri oluştur
export const berberShops = generateBerberShops(8);
export const kuaforShops = generateKuaforShops(8);
export const guzellikMerkeziShops = generateGuzellikMerkeziShops(8);
export const spaShops = generateSpaShops(8);
export const tirnakShops = generateTirnakShops(8);

// Tüm test işletmelerini birleştir
export const allTestShops = [
  ...berberShops,
  ...kuaforShops,
  ...guzellikMerkeziShops,
  ...spaShops,
  ...tirnakShops
];

// Popüler işletmeleri filtrele (4.6+ rating)
export const getPopularTestShops = () => {
  return allTestShops.filter(shop => {
    const rating = typeof shop.rating === 'number' ? shop.rating : shop.rating?.average;
    return rating && rating >= 4.6;
  });
};

// İşletme kategorilerini al
export const getShopCategories = () => {
  return ['Berber', 'Kuaför', 'Güzellik Merkezi', 'Spa', 'Tırnak Bakımı'];
};

// Kategoriye göre işletmeleri al
export const getShopsByCategory = (category) => {
  switch (category) {
    case 'Berber': return berberShops;
    case 'Kuaför': return kuaforShops;
    case 'Güzellik Merkezi': return guzellikMerkeziShops;
    case 'Spa': return spaShops;
    case 'Tırnak Bakımı': return tirnakShops;
    default: return allTestShops;
  }
};

// Test randevuları oluştur
export const getTestAppointments = () => {
  const statuses = ['pending', 'confirmed', 'completed', 'canceled'];
  const appointments = [];
  
  // Her kategoriden işletmeler için random randevular oluştur
  for (let i = 0; i < 10; i++) {
    // Rastgele bir işletme seç
    const allShops = [...berberShops, ...kuaforShops, ...guzellikMerkeziShops, ...spaShops, ...tirnakShops];
    const randomShop = allShops[Math.floor(Math.random() * allShops.length)];
    
    // Randevu tarihi oluştur (geçmiş veya gelecek)
    const isPastAppointment = i % 2 === 0;
    const today = new Date();
    let appointmentDate;
    
    if (isPastAppointment) {
      // Son 30 günde geçmiş tarih
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      appointmentDate = pastDate;
    } else {
      // Önümüzdeki 30 günde gelecek tarih
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
      appointmentDate = futureDate;
    }
    
    // Randevu saati
    const hour = 10 + Math.floor(Math.random() * 8); // 10:00 - 17:00 arası
    const minute = Math.random() > 0.5 ? 0 : 30; // 00 veya 30 dakika
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Durum belirle
    let status;
    if (isPastAppointment) {
      status = Math.random() > 0.2 ? 'completed' : 'canceled';
    } else {
      status = Math.random() > 0.3 ? 'confirmed' : 'pending';
    }
    
    // Ücret
    const price = Math.floor(50 + Math.random() * 250);
    
    appointments.push({
      id: uuidv4(),
      shopId: randomShop.id,
      shopName: randomShop.name,
      serviceName: `${randomShop.category} Hizmeti`,
      date: appointmentDate,
      time: timeStr,
      duration: 30 + Math.floor(Math.random() * 5) * 15, // 30-90 dk
      status: status,
      price: price,
      shopImage: randomShop.images.main,
      address: randomShop.location.address + ', ' + randomShop.location.district,
      userId: 'currentUser'
    });
  }
  
  return appointments;
};

// Test bildirimlerini oluştur
export const getTestNotifications = () => {
  const notificationTypes = ['appointment', 'message', 'system', 'review'];
  const notifications = [];
  
  // Test bildirimleri oluştur
  for (let i = 0; i < 15; i++) {
    const notificationType = notificationTypes[i % notificationTypes.length];
    const isRead = i > 5; // İlk 5 bildirim okunmamış olsun
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (14 - i)); // Son 14 günden bildirimler
    
    let title, message, relatedId;
    
    switch (notificationType) {
      case 'appointment':
        title = 'Randevu Hatırlatması';
        message = `${Math.floor(Math.random() * 3) + 1} gün sonra bir randevunuz bulunmaktadır.`;
        relatedId = uuidv4();
        break;
      case 'message':
        title = 'Yeni Mesaj';
        message = 'İşletme size yeni bir mesaj gönderdi.';
        relatedId = uuidv4();
        break;
      case 'system':
        title = 'Sistem Bildirimi';
        message = 'Profiliniz başarıyla güncellendi.';
        break;
      case 'review':
        title = 'Değerlendirme Hatırlatması';
        message = 'Son randevunuzu değerlendirmeyi unutmayın.';
        relatedId = uuidv4();
        break;
      default:
        title = 'Bildirim';
        message = 'Yeni bir bildiriminiz var.';
    }
    
    notifications.push({
      id: uuidv4(),
      title,
      message,
      type: notificationType,
      isRead,
      createdAt: notificationType === 'appointment' ? new Date().toISOString() : createdDate.toISOString(),
      userId: 'currentUser',
      relatedId
    });
  }
  
  return notifications;
};

// Favori işletmeleri getir
export const getFavoriteShops = () => {
  // Tüm işletmelerden rastgele 8 favorili işletme seç
  const favorites = [];
  const allShops = [...berberShops, ...kuaforShops, ...guzellikMerkeziShops, ...spaShops, ...tirnakShops];
  
  // 4,7+ puan alan işletmeleri öncelikle favori yap
  const highRatedShops = allShops.filter(shop => shop.rating.average >= 4.7);
  
  // Yüksek puanlı işletmelerden 5 tanesini favorilere ekle
  for (let i = 0; i < Math.min(5, highRatedShops.length); i++) {
    favorites.push(highRatedShops[i]);
  }
  
  // Geri kalan favorileri rastgele ekle
  while (favorites.length < 8) {
    const randomIndex = Math.floor(Math.random() * allShops.length);
    const randomShop = allShops[randomIndex];
    
    // Favorilerde yoksa ekle
    if (!favorites.some(shop => shop.id === randomShop.id)) {
      favorites.push(randomShop);
    }
  }
  
  return favorites;
};
