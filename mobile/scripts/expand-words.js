// Expands every category toward 150 common, recognizable Nigerian words —
// per the review call: 150/category is achievable without sacrificing
// guessability (500 was not, for several categories). Additions are
// deduped against existing entries and capped at 150.
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'words.default.json');
const publicPath = path.join(__dirname, '..', '..', 'words.json');

const words = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const ADDITIONS = {
  food: [
    'Ewedu soup','Gbegiri soup','Ofada stew','Native soup','Kolanut','Groundnut soup',
    'Vegetable soup','Ponmo','Shaki','Roasted plantain','Turkey stew','Chicken stew',
    'Fried chicken','Grilled fish','Point and kill','Jollof spaghetti','Yam pottage',
    'Ekpang nkukwo','Atama soup','Fisherman soup','Okazi soup','Nsala fish',
    'Amala and gbegiri','Rice and beans','Ewa agoyin','Boli','Roasted yam','Custard',
    'Pap and moimoi','Chapman','Kunun aya','Kunun gyada','Bigi cola','La casera',
    'Vitamalt','Supermalt','Amstel malta','Five alive','Chivita','Meat pie','Fish pie',
    'Doughnut','Cabin biscuits','Cream cracker','Milo drink','Bournvita','Elubo',
    'Miyan kuka','Miyan taushe','Dambu nama','Waina','Kosai','Suya spice','Yaji spice',
    'Ata din din','Efo elegusi','Cow tail soup','Titus fish','Panla fish','Croaker fish',
    'Sardine stew','Corned beef','Golden morn','Cerelac','Yam flour swallow',
    'Ogbono with fish','Beans porridge','Plantain porridge','Coconut candy',
    'Groundnut candy','Tiger nut milk','Watermelon juice','Pineapple juice',
    'Cashew fruit','Roasted groundnut','Boli and groundnut',
  ],
  emotions: [
    'Shy','Embarrassed','Proud','Insecure','Hopeful','Grateful','Content','Bored',
    'Curious','Suspicious','Nervous','Calm','Peaceful','Restless','Irritated',
    'Annoyed','Hurt','Vulnerable','Empowered','Inspired','Amused','Delighted',
    'Anxious about exams','Homesick for Naija','Missing family','Proud of my hustle',
    'Overjoyed','Devastated','Heartbroken','Relieved it is over','Terrified',
    'Suspicious of person','Feeling blessed','Grateful for life','Sapa season',
    'First salary joy','Japa dream','Waiting for alert','Network wahala frustration',
    'Traffic frustration','NEPA anger','Exam fear','Result day anxiety','Wedding jitters',
    'New job excitement','Graduation pride','Falling in love','Getting over heartbreak',
    'Missing an ex','Village people paranoia','Testimony joy','Answered prayer relief',
    'Disgust','Awe','Wonder','Sympathy','Empathy','Guilt trip','Second guessing',
    'Overprotective love','Sibling rivalry envy','Peer pressure stress','Burnt out',
    'Motivated Monday','Lazy Sunday','Payday happiness','Broke before payday',
    'Nervous first date','Wedding day joy','New baby joy','Missing childhood',
    'Culture pride','Language barrier frustration','Feeling left out',
  ],
  activities: [
    'Watching Nollywood movie','Playing ludo with friends','Cooking Sunday rice',
    'Ironing school uniform','Sweeping the compound','Fetching firewood',
    'Pounding yam with mortar','Grinding pepper on stone','Washing clothes by hand',
    'Charging phone at kiosk','Buying credit recharge','Watching Premier League',
    'Betting on football','Reading newspaper at bus stop','Selling by roadside',
    'Bargaining for fare','Waiting for danfo','Standing in fuel queue',
    'Filling water at borehole','Sweeping classroom','Reciting national anthem',
    'Saluting the flag','Morning assembly','Lesson after school','Extra classes',
    'JAMB registration','Post UTME screening','Convocation ceremony','NYSC passing out',
    'Corper camping drills','Man o war training','Village homecoming',
    'Burial ceremony','Condolence visit','Naming a child','First birthday party',
    'Housewarming party','Send forth party','Retirement party','Office Christmas party',
    'Salary alert celebration','Landlord rent collection','Agbero collecting money',
    'Conductor calling passengers','Hawker selling in traffic','Roadside mechanic work',
    'Vulcanizer fixing tyre','Tailor taking measurement','Barber shop gist',
    'Salon braiding hair','Market Day shopping','Grinding tomatoes at mill',
    'Cutting firewood','Fanning coal pot','Lighting stove','Carrying baby on back',
    'Waist beads tying','Native attire fitting','Church choir practice',
    'Sunday best dressing','Family compound meeting','Age grade contribution',
    'Village square gathering','Storytelling under moonlight','Playing suwe outside',
    'Skipping rope','Flying kite','Riding bicycle','Playing street football',
  ],
  movies: [
    'Baby Farm','Anikulapo','Elesin Oba','Gangs of Lagos','Jagun Jagun','Aiyinla',
    'Sugar Rush','Namaste Wahala','Chief Daddy 2','The Set Up','Quam’s Money',
    'Eyimofe','Water and Garri','Moremi','House of Ga a','Progressive Tailors Club',
    'A Simple Lie','Òlòturé','Lionheart','Brotherhood','King of Thieves',
    'Ratnik','Sanitation Day','The Perfect Arrangement','Kada River',
    'Diiche','Christmas in Lagos','Ijakumo','Amina','93 Days',
    'Half of a Yellow Sun','October 1','Mokalik','The Milkmaid','Up North',
    'Living in Bondage Breaking Free','Lekki Wives','Skinny Girl in Transit',
    'Wentworth','Battleground','Riona','Inspector K','Diamond in the Rough',
    'Nneka the Pretty Serpent','Ekwueme','Dumebi the Dirty Girl','Wedding Party 2',
    'Isoken','93 Days movie','Bling Lagosians','Sylvia','Aki na Ukwa',
    'Rattlesnake','Country Hard','Oga Bello','Saworoide','Thunderbolt',
    'Igodo','End of the Wicked','Karashika','Diamond Ring','Mr and Mrs',
    'The Wait','New Money','Love is War','Elevator Baby','Oga Madam',
    'A Trip to Jamaica','Merry Men 2','Sinner','Progressive Tailors',
    'Man of God','Jenifa Till I Die','Oloture 2','Yahoo Plus',
  ],
  locations: [
    'Ojuelegba','Iyana Ipaja','Berger Bus Stop','Costain','CMS','Idumota Market',
    'Trade Fair Complex','Mile 12 Fruit Market','Computer Village','Alaba Rago',
    'Oyingbo Market','Ile Epo','Ejigbo','Isolo','Amuwo Odofin','Satellite Town',
    'Ojo','Volkswagen Bus Stop','Iyana Iba','FESTAC 2nd Gate','Alagbado',
    'Sango Ota','Mowe','Ibafo','Magboro','Simawa','Redemption Camp',
    'Sagamu Interchange','Iwo Road','Challenge Ibadan','Mokola','Bodija',
    'Ring Road Ibadan','Total Garden','Gbagi Market','New Garage',
    'Ekotedo','Sabo Ibadan','Oje Market','Mile 12','Owode Market',
    'Ile Ife OAU','Osogbo Sacred Grove','Erin Ijesha Waterfalls','Idanre Hills',
    'Olumo Rock','Kajola','Ijebu Ode','Sagamu','Shagamu','Ake Palace Abeokuta',
    'Nike Lake Resort','Awhum Waterfalls','Ngwo Pine Forest','Milliken Hill',
    'Ninth Mile Enugu','Emene Enugu','New Haven Enugu','Independence Layout',
    'Government Reserved Area','Trans Ekulu Enugu','Achara Layout',
    'Owerri Zoo','Concord Hotel Owerri','Relief Market Owerri','World Bank Owerri',
    'Douglas Road','Wetheral Road','Ikot Ekpene','Uyo Township Stadium',
    'Ibom Plaza','Nwaniba Beach','Tinapa Resort','Marina Calabar','Mary Slessor Roundabout',
  ],
  music: [
    'Portable','Seyi Vibez','Bella Shmurda','Zlatan','Naira Marley','Mohbad',
    'Reekado Banks','Victony','Lojay','Bnxn','Ruger','Young Jonn',
    'Shallipopi','Odumodublvck','BOJ','Ajebo Hustlers','Blaqbonez',
    'Ycee','Runtown','Solidstar','Iyanya','Harrysong','Duncan Mighty',
    'Omawumi','Waje','Niniola','Teni','Chike','Johnny Drille',
    'Cobhams Asuquo','Asa','Nneka','Brymo','Vector','MI Abaga',
    'Ice Prince','Jesse Jagz','Sound Sultan','Terry G','9ice',
    'Lagbaja mask','Charly Boy','Dbanj Kokolet','Obiwon','Bracket',
    'Bez Idakula','Praiz','Chidinma','Waje Iyabo','Tekno Diana',
    'Burna Boy Last Last','Davido Timeless','Wizkid Ojuelegba',
    'Rema Ginger Me','Ayra Starr Sability','Asake Sungba',
    'Kizz Daniel Cough','Fireboy Bandana','Omah Lay Bad Influence',
    'CKay Emiliana','Tems Higher','BNXN Gwagwalada','Ruger Bounce',
    'Seyi Vibez Chance','Portable Zazu','Naira Marley Am I A Yahoo Boy',
    'Fuji house','Apala legend','Highlife band','Juju music legend',
    'Gospel choir hit','Praise medley','Igbo highlife','Yoruba fuji star',
    'Hausa music star','Afrobeat legend Fela','Afrobeats to the world',
    'Grammy win Nigeria','Headies award night','AFRIMA award',
  ],
  slangs: [
    'Japa','I dey vex','No be small thing','E don cast','Wahala no dey finish',
    'Abeg no vex','I don blow','Na packaging be that','You too known',
    'Omo see gobe','I don see finish','Na wa for you','You dey mind who',
    'Nawa o','I no send','Na condition make crayfish bend','E get why',
    'You never see anything','Na so life be','Money no be problem',
    'I dey manage','No let money finish','Chop life','Enjoyment no get holiday',
    'Werey','Oshi','Pepper dem','You don try','E no easy',
    'God dey','No shaking','I sabi you','Cruise am','Vibes no dey',
    'Omo you sef','Na you sabi','I no dey carry last','Baba no gree',
    'Wetin sup','I dey here o','No be by force','You go dey alright',
    'God when','Na packaging','Person don blow','E don red','No gree',
    'Wahala be like say','I no fit come and kill myself','E surprise me',
    'You too much','Correct guy','Baba wa','Na so e supposed be',
    'I don land','No be today','Omo bad guy','You sha know',
    'E don tey','No wahala at all','Baba God go do am','Person wey sabi',
    'I no send anybody','Na condition','You dey craze','Omo see levels',
    'I don hear you','Baba just relax','Chai see wahala','No be small levels',
    'Person don change','Wetin dey happen','Correct person','You no fit understand',
    'God abeg help me','Na today things go show','Person don enter am','I never ready',
    'Na you go know','Baba just calm down','I no gree at all','Person don try',
  ],
  animals: [
    'African wild dog','Cheetah','Zebra','Giraffe','Ostrich','Rhinoceros',
    'Antelope','Gazelle','Wildebeest','Meerkat','Aardvark','Hedgehog',
    'Genet','Serval','Caracal','Spotted hyena','Vervet monkey','Colobus monkey',
    'Patas monkey','Red river hog','Bush pig','West African manatee',
    'Nile monitor','Forest cobra','Gaboon viper','Black mamba','Green mamba',
    'Skink','Agama','House lizard','African clawed frog','Goliath frog',
    'Electric catfish','African lungfish','Snakehead fish','Barracuda',
    'Sea turtle','Stingray','Jellyfish','Starfish','Sea urchin',
    'Weaver ant','Soldier ant','Cattle egret','Hooded vulture','African grey parrot',
    'Fire finch','Village weaver bird','Palm nut vulture','Marabou stork',
    'Crested crane','African fish eagle','Speckled pigeon','Laughing dove',
    'Bushbuck','Duiker','Red flanked duiker','Cane rat','Giant pouched rat',
    'African civet','Palm civet','Fruit bat','Straw coloured fruit bat',
    'African elephant','Forest elephant','Black rhino','White rhino',
    'Common house gecko','Wall gecko','Mud crab','Tiger prawn',
  ],
  occupations: [
    'Ushering','Traffic warden','Sanitation worker','Waste collector',
    'Cleaner','House help','Nanny','Cook','Chef','Baker','Confectioner',
    'Printer','Signwriter','Sound engineer','Radio presenter','TV presenter',
    'Newscaster','Journalist','Blogger','Vlogger','Real estate agent',
    'Estate valuer','Surveyor','Architect','Quantity surveyor',
    'Civil engineer','Mechanical engineer','Electrical engineer',
    'Petroleum engineer','Marine engineer','Aircraft pilot','Air hostess',
    'Ship captain','Truck driver','Bus driver','Tricycle mechanic',
    'Shoe cobbler','Shoemaker','Leather worker','Weaver','Potter',
    'Blacksmith','Wood carver','Sculptor','Painter artist','Graphic printer',
    'Event decorator','Wedding planner','Caterer','Hotelier','Waiter',
    'Bartender','Club DJ','Radio OAP','Voice-over artist','Translator',
    'Interpreter','Tour guide','Travel agent','Customs broker',
    'Freight forwarder','Warehouse manager','Supply chain officer',
    'Logistics manager','Delivery rider','Dispatch rider','Cargo handler',
  ],
  sports: [
    'NFF','LMC','Aiteo Cup','Federation Cup','Super Four','Glo Premier League',
    'Nigeria Professional Football League','Nationwide League','Asisat Oshoala',
    'Rasheedat Ajibade','Onome Ebi','Desire Oparanozie','Mikel Obi captain',
    'Wilfred Ndidi','Alex Iwobi','Kelechi Iheanacho','Samuel Chukwueze',
    'Moses Simon','Calvin Bassey','William Troost Ekong','Taiwo Awoniyi',
    'Frank Onyeka','Joe Aribo','Ola Aina','Zaidu Sanusi','Maduka Okoye',
    'Francis Uzoho','Super Eagles jersey','Green Eagles','Dream Team',
    'Atlanta 96 gold','USA 94 World Cup','Golden Eaglets','Flying Eagles',
    'Falconets','D Tigers basketball','Nigeria basketball federation',
    'National Sports Festival','Delta 2022 Games','Item 7 sports',
    'Inter house sports','Sports day','100m relay','Sack race school',
    'Egg and spoon school','Tug of war school','High jump school',
    'Long jump pit','Javelin throw','Discus throw','Shot put field',
    'Table tennis club','Squash court','Badminton court','Snooker hall',
    'Pool table game','Draughts board','Chess club','Scrabble tournament',
    'Whot cards','Ludo board','Ayo board game','Suwe hopscotch',
    'Street football','Beach football','Five a side','Amateur boxing',
    'Traditional wrestling match','Dambe boxing','Kokawa wrestling',
  ],
};

let report = [];
for (const key of Object.keys(ADDITIONS)) {
  const cat = words[key];
  if (!cat) { console.warn(`Unknown category: ${key}`); continue; }
  const existing = new Set(cat.words.map((w) => w.toLowerCase()));
  let added = 0;
  for (const w of ADDITIONS[key]) {
    if (cat.words.length >= 150) break;
    const k = w.toLowerCase();
    if (existing.has(k)) continue;
    cat.words.push(w);
    existing.add(k);
    added++;
  }
  report.push(`${key}: +${added} -> ${cat.words.length}`);
}

fs.writeFileSync(dataPath, JSON.stringify(words, null, 2) + '\n', 'utf8');
fs.writeFileSync(publicPath, JSON.stringify(words, null, 2) + '\n', 'utf8');

console.log(report.join('\n'));
console.log('\nTotal words:', Object.values(words).reduce((n, c) => n + c.words.length, 0));
