export interface Upazila {
  id: string;
  nameBn: string;
  nameEn: string;
}

export interface District {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  divisionId: string;
  upazilas: string[];
}

export interface Division {
  id: string;
  nameBn: string;
  nameEn: string;
}

export const DIVISIONS: Division[] = [
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' }
];

export const DISTRICTS: District[] = [
  // Mymensingh Division
  {
    id: 'sherpur',
    slug: 'sherpur',
    nameBn: 'শেরপুর',
    nameEn: 'Sherpur',
    divisionId: 'mymensingh',
    upazilas: ['শেরপুর সদর', 'নকলা', 'নালিতাবাড়ী', 'শ্রীবরদী', 'ঝিনাইগাতী']
  },
  {
    id: 'mymensingh',
    slug: 'mymensingh',
    nameBn: 'ময়মনসিংহ',
    nameEn: 'Mymensingh',
    divisionId: 'mymensingh',
    upazilas: ['ময়মনসিংহ সদর', 'ত্রিশাল', 'মুক্তাগাছা', 'গফরগাঁও', 'ভালুকা', 'ফুলপুর', 'তারাকান্দা', 'গৌরীপুর', 'ঈশ্বরগঞ্জ', 'হালুয়াঘাট', 'ধোবাউড়া', 'নান্দাইল', 'ফুলবাড়ীয়া']
  },
  {
    id: 'jamalpur',
    slug: 'jamalpur',
    nameBn: 'জামালপুর',
    nameEn: 'Jamalpur',
    divisionId: 'mymensingh',
    upazilas: ['জামালপুর সদর', 'মেলান্দহ', 'মাদারগঞ্জ', 'ইসলামপুর', 'সরিষাবাড়ী', 'বকশীগঞ্জ', 'দেওয়ানগঞ্জ']
  },
  {
    id: 'netrokona',
    slug: 'netrokona',
    nameBn: 'নেত্রকোণা',
    nameEn: 'Netrokona',
    divisionId: 'mymensingh',
    upazilas: ['নেত্রকোণা সদর', 'কেন্দুয়া', 'মদন', 'মোহনগঞ্জ', 'পূর্বধলা', 'দুর্গাপুর', 'কলমাকান্দা', 'বারহাট্টা', 'আটপাড়া', 'খালিয়াজুড়ী']
  },

  // Dhaka Division
  {
    id: 'dhaka',
    slug: 'dhaka',
    nameBn: 'ঢাকা',
    nameEn: 'Dhaka',
    divisionId: 'dhaka',
    upazilas: ['মিরপুর', 'ধানমন্ডি', 'গুলশান', 'উত্তরা', 'মোহাম্মদপুর', 'যাত্রাবাড়ী', 'বাড্ডা', 'শাহবাগ', 'মতিঝিল', 'খিলগাঁও', 'সাভার', 'ধামরাই', 'কেরানীগঞ্জ', 'নবাবগঞ্জ', 'দোহার']
  },
  {
    id: 'gazipur',
    slug: 'gazipur',
    nameBn: 'গাজীপুর',
    nameEn: 'Gazipur',
    divisionId: 'dhaka',
    upazilas: ['গাজীপুর সদর', 'টঙ্গী', 'কালিয়াকৈর', 'শ্রীপুর', 'কাপাসিয়া', 'কালীগঞ্জ']
  },
  {
    id: 'narayanganj',
    slug: 'narayanganj',
    nameBn: 'নারায়ণগঞ্জ',
    nameEn: 'Narayanganj',
    divisionId: 'dhaka',
    upazilas: ['নারায়ণগঞ্জ সদর', 'সিদ্ধিরগঞ্জ', 'ফতুল্লা', 'সোনারগাঁও', 'রূপগঞ্জ', 'আড়াইহাজার', 'বন্দর']
  },
  {
    id: 'tangail',
    slug: 'tangail',
    nameBn: 'টাঙ্গাইল',
    nameEn: 'Tangail',
    divisionId: 'dhaka',
    upazilas: ['টাঙ্গাইল সদর', 'মির্জাপুর', 'কালিহাতী', 'ঘাটাইল', 'মধুপুর', 'সখিপুর', 'নাগরপুর', 'দেলদুয়ার', 'ভূঞাপুর', 'বাসাইল']
  },
  {
    id: 'faridpur',
    slug: 'faridpur',
    nameBn: 'ফরিদপুর',
    nameEn: 'Faridpur',
    divisionId: 'dhaka',
    upazilas: ['ফরিদপুর সদর', 'বোয়ালমারী', 'মধুখালী', 'ভাঙ্গা', 'সালথা', 'নগরকান্দা', 'চরভদ্রাসন', 'সদরপুর', 'আলফাডাঙ্গা']
  },
  {
    id: 'manikganj',
    slug: 'manikganj',
    nameBn: 'মানিকগঞ্জ',
    nameEn: 'Manikganj',
    divisionId: 'dhaka',
    upazilas: ['মানিকগঞ্জ সদর', 'সিংগাইর', 'শিবালয়', 'সাটুরিয়া', 'ঘিওর', 'দৌলতপুর', 'হরিরামপুর']
  },
  {
    id: 'munshiganj',
    slug: 'munshiganj',
    nameBn: 'মুন্সীগঞ্জ',
    nameEn: 'Munshiganj',
    divisionId: 'dhaka',
    upazilas: ['মুন্সীগঞ্জ সদর', 'শ্রীনগর', 'সিরাজদিখান', 'লৌহজং', 'গজারিয়া', 'টঙ্গীবাড়ী']
  },
  {
    id: 'narsingdi',
    slug: 'narsingdi',
    nameBn: 'নরসিংদী',
    nameEn: 'Narsingdi',
    divisionId: 'dhaka',
    upazilas: ['নরসিংদী সদর', 'পলাশ', 'বেলাবো', 'মনোহরদী', 'রায়পুরা', 'শিবপুর']
  },
  {
    id: 'kishoreganj',
    slug: 'kishoreganj',
    nameBn: 'কিশোরগঞ্জ',
    nameEn: 'Kishoreganj',
    divisionId: 'dhaka',
    upazilas: ['কিশোরগঞ্জ সদর', 'ভৈরব', 'বাজিতপুর', 'হোসেনপুর', 'করিমগঞ্জ', 'তাড়াইল', 'পাকুন্দিয়া', 'কটিয়াদী', 'নিকলী', 'অষ্টগ্রাম', 'ইটনা', 'মিঠামইন']
  },

  // Chattogram Division
  {
    id: 'chattogram',
    slug: 'chattogram',
    nameBn: 'চট্টগ্রাম',
    nameEn: 'Chattogram',
    divisionId: 'chattogram',
    upazilas: ['কোতোয়ালী', 'পাঁচলাইশ', 'হালিশহর', 'পতেঙ্গা', 'পটিয়া', 'হাটহাজারী', 'সীতাকুণ্ড', 'মিরসরাই', 'রাঙ্গুনিয়া', 'ফটিকছড়ি', 'আনোয়ারা', 'বোয়ালখালী', 'চন্দনাইশ', 'সাতকানিয়া', 'লোহাগাড়া']
  },
  {
    id: 'coxsbazar',
    slug: 'coxsbazar',
    nameBn: 'কক্সবাজার',
    nameEn: 'Cox\'s Bazar',
    divisionId: 'chattogram',
    upazilas: ['কক্সবাজার সদর', 'রামু', 'টেকনাফ', 'উখিয়া', 'চকোরিয়া', 'পেকুয়া', 'মহেশখালী', 'কুতুবদিয়া']
  },
  {
    id: 'cumilla',
    slug: 'cumilla',
    nameBn: 'কুমিল্লা',
    nameEn: 'Cumilla',
    divisionId: 'chattogram',
    upazilas: ['কুমিল্লা আদর্শ সদর', 'দাউদকান্দি', 'চান্দিনা', 'লাকসাম', 'বুড়িচং', 'দেবীদ্বার', 'মুরাদনগর', 'হোমনা', 'চৌদ্দগ্রাম', 'বরুড়া', 'মনোহরগঞ্জ', 'ব্রাহ্মণপাড়া', 'নাঙ্গলকোট', 'মেঘনা', 'তিতাস']
  },
  {
    id: 'brahmanbaria',
    slug: 'brahmanbaria',
    nameBn: 'ব্রাহ্মণবাড়িয়া',
    nameEn: 'Brahmanbaria',
    divisionId: 'chattogram',
    upazilas: ['ব্রাহ্মণবাড়িয়া সদর', 'আশুগঞ্জ', 'সরাইল', 'কসবা', 'নবীনগর', 'বাঞ্ছারামপুর', 'নাসিরনগর', 'আখাউড়া', 'বিজয়নগর']
  },
  {
    id: 'noakhali',
    slug: 'noakhali',
    nameBn: 'নোয়াখালী',
    nameEn: 'Noakhali',
    divisionId: 'chattogram',
    upazilas: ['নোয়াখালী সদর', 'বেগমগঞ্জ', 'চাটখিল', 'সেনবাগ', 'কোম্পানীগঞ্জ', 'হাতিয়া', 'কবিরহাট', 'সুবর্ণচর', 'সোনাইমুড়ী']
  },
  {
    id: 'feni',
    slug: 'feni',
    nameBn: 'ফেনী',
    nameEn: 'Feni',
    divisionId: 'chattogram',
    upazilas: ['ফেনী সদর', 'দাগনভূঞা', 'সোনাগাজী', 'ছাগলনাইয়া', 'পরশুরাম', 'ফুলগাজী']
  },

  // Rajshahi Division
  {
    id: 'rajshahi',
    slug: 'rajshahi',
    nameBn: 'রাজশাহী',
    nameEn: 'Rajshahi',
    divisionId: 'rajshahi',
    upazilas: ['বোয়ালিয়া', 'মতিহার', 'রাজপাড়া', 'শাহ মখদুম', 'পবা', 'গোদাগাড়ী', 'তানোর', 'বাঘা', 'চারঘাট', 'পুঠিয়া', 'দুর্গাপুর', 'বাগমারা', 'মোহনপুর']
  },
  {
    id: 'bogura',
    slug: 'bogura',
    nameBn: 'বগুড়া',
    nameEn: 'Bogura',
    divisionId: 'rajshahi',
    upazilas: ['বগুড়া সদর', 'শেরপুর', 'শিবগঞ্জ', 'সারিয়াকান্দি', 'গাবতলী', 'ধুনট', 'সোনাতলা', 'কাহালু', 'নন্দীগ্রাম', 'দুপচাঁচিয়া', 'আদমদীঘি', 'শাজাহানপুর']
  },
  {
    id: 'pabna',
    slug: 'pabna',
    nameBn: 'পাবনা',
    nameEn: 'Pabna',
    divisionId: 'rajshahi',
    upazilas: ['পাবনা সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'চাটমোহর', 'সুজানগর', 'বেড়া', 'ফরিদপুর', 'ভাঙ্গুড়া', 'আটঘরিয়া']
  },
  {
    id: 'sirajganj',
    slug: 'sirajganj',
    nameBn: 'সিরাজগঞ্জ',
    nameEn: 'Sirajganj',
    divisionId: 'rajshahi',
    upazilas: ['সিরাজগঞ্জ সদর', 'শাহজাদপুর', 'উল্লাপাড়া', 'বেলকুচি', 'রায়গঞ্জ', 'তাড়াশ', 'কামারখন্দ', 'কাজিপুর', 'চৌহালী']
  },

  // Khulna Division
  {
    id: 'khulna',
    slug: 'khulna',
    nameBn: 'খুলনা',
    nameEn: 'Khulna',
    divisionId: 'khulna',
    upazilas: ['খুলনা সদর', 'সোনাডাঙ্গা', 'খালিশপুর', 'দৌলতপুর', 'খানজাহান আলী', 'ডুমুরিয়া', 'রূপসা', 'তেরখাদা', 'ফুলতলা', 'বটিয়াঘাটা', 'পাইকগাছা', 'কয়রা', 'দাকোপ', 'দিঘলিয়া']
  },
  {
    id: 'jashore',
    slug: 'jashore',
    nameBn: 'যশোর',
    nameEn: 'Jashore',
    divisionId: 'khulna',
    upazilas: ['যশোর সদর', 'ঝিকরগাছা', 'শার্শা', 'মনিরামপুর', 'কেশবপুর', 'চৌগাছা', 'বাঘারপাড়া', 'অভয়নগর']
  },
  {
    id: 'kushtia',
    slug: 'kushtia',
    nameBn: 'কুষ্টিয়া',
    nameEn: 'Kushtia',
    divisionId: 'khulna',
    upazilas: ['কুষ্টিয়া সদর', 'কুমারখালী', 'মিরপুর', 'ভেড়ামারা', 'দৌলতপুর', 'খোকসা']
  },

  // Sylhet Division
  {
    id: 'sylhet',
    slug: 'sylhet',
    nameBn: 'সিলেট',
    nameEn: 'Sylhet',
    divisionId: 'sylhet',
    upazilas: ['কোতোয়ালী', 'জালালাবাদ', 'বিমানবন্দর', 'দক্ষিণ সুরমা', 'গোলাপগঞ্জ', 'বিয়ানীবাজার', 'জকিগঞ্জ', 'কানাইঘাট', 'জৈন্তাপুর', 'গোয়াইনঘাট', 'কোম্পানীগঞ্জ', 'ফেঞ্চুগঞ্জ', 'ওসমানীনগর', 'বালাগঞ্জ']
  },
  {
    id: 'moulvibazar',
    slug: 'moulvibazar',
    nameBn: 'মৌলভীবাজার',
    nameEn: 'Moulvibazar',
    divisionId: 'sylhet',
    upazilas: ['মৌলভীবাজার সদর', 'শ্রীমঙ্গল', 'কমলগঞ্জ', 'কুলাউড়া', 'বড়লেখা', 'জুড়ী', 'রাজনগর']
  },

  // Barishal Division
  {
    id: 'barishal',
    slug: 'barishal',
    nameBn: 'বরিশাল',
    nameEn: 'Barishal',
    divisionId: 'barishal',
    upazilas: ['কোতোয়ালী', 'বাবুগঞ্জ', 'উজিরপুর', 'গৌরনদী', 'আগৈলঝাড়া', 'বানারীপাড়া', 'মুলাদী', 'মেহেন্দিগঞ্জ', 'হিজলা', 'বাকেরগঞ্জ']
  },

  // Rangpur Division
  {
    id: 'rangpur',
    slug: 'rangpur',
    nameBn: 'রংপুর',
    nameEn: 'Rangpur',
    divisionId: 'rangpur',
    upazilas: ['রংপুর সদর', 'গঙ্গাচড়া', 'তারাগঞ্জ', 'বদরগঞ্জ', 'মিঠাপুকুর', 'পীরগাছা', 'কাউনিয়া', 'পীরগঞ্জ']
  },
  {
    id: 'dinajpur',
    slug: 'dinajpur',
    nameBn: 'দিনাজপুর',
    nameEn: 'Dinajpur',
    divisionId: 'rangpur',
    upazilas: ['দিনাজপুর সদর', 'বিরল', 'বীরগঞ্জ', 'বোচাগঞ্জ', 'কাহারোল', 'ফুলবাড়ী', 'পার্বতীপুর', 'নবাবগঞ্জ', 'ঘোড়াঘাট', 'হাকিমপুর', 'বিরামপুর', 'চিরিরবন্দর', 'খানসামা']
  }
];

export function getDistrictBySlug(slug: string): District | undefined {
  return DISTRICTS.find(d => d.slug.toLowerCase() === slug.toLowerCase() || d.id === slug);
}

export function getDistrictsByDivision(divisionId: string): District[] {
  return DISTRICTS.filter(d => d.divisionId === divisionId);
}
