const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/manufacturing_crm';

// ============================================================
// SEED DATA
// ============================================================

const users = [
  // Admin
  {
    name: 'Rajesh Kumar',
    email: 'admin@mfgcrm.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 98765 43210',
    department: 'Administration',
    isActive: true,
  },
  // Managers
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@mfgcrm.com',
    password: 'password123',
    role: 'manager',
    phone: '+91 98765 43211',
    department: 'Sales Management',
    isActive: true,
  },
  {
    name: 'Vikram Patel',
    email: 'vikram.patel@mfgcrm.com',
    password: 'password123',
    role: 'manager',
    phone: '+91 98765 43212',
    department: 'Business Development',
    isActive: true,
  },
  // BDAs
  {
    name: 'Ananya Desai',
    email: 'ananya.desai@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43213',
    department: 'Sales',
    isActive: true,
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43214',
    department: 'Sales',
    isActive: true,
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43215',
    department: 'Sales',
    isActive: true,
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43216',
    department: 'Business Development',
    isActive: true,
  },
  {
    name: 'Divya Nair',
    email: 'divya.nair@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43217',
    department: 'Business Development',
    isActive: true,
  },
  {
    name: 'Rohan Gupta',
    email: 'rohan.gupta@mfgcrm.com',
    password: 'password123',
    role: 'bda',
    phone: '+91 98765 43218',
    department: 'Sales',
    isActive: true,
  },
];

const leadSources = ['Website', 'Referral', 'TradeShow', 'ColdCall', 'LinkedIn', 'Advertisement', 'Other'];
const statuses = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'];
const priorities = ['Low', 'Medium', 'High'];

const leadTemplates = [
  {
    companyName: 'Tata Steel Ltd',
    contactPerson: 'Amit Verma',
    email: 'amit.verma@tatasteel.com',
    phone: '+91 22 6665 8282',
    industry: 'Steel Manufacturing',
    expectedRevenue: 4500000,
  },
  {
    companyName: 'Larsen & Toubro Ltd',
    contactPerson: 'Suresh Iyer',
    email: 'suresh.iyer@lnt.com',
    phone: '+91 22 6752 5656',
    industry: 'Engineering & Construction',
    expectedRevenue: 8500000,
  },
  {
    companyName: 'Bharat Forge Ltd',
    contactPerson: 'Ramesh Kulkarni',
    email: 'ramesh.kulkarni@bharatforge.com',
    phone: '+91 20 6704 2400',
    industry: 'Auto Components',
    expectedRevenue: 3200000,
  },
  {
    companyName: 'Asian Paints Ltd',
    contactPerson: 'Deepak Joshi',
    email: 'deepak.joshi@asianpaints.com',
    phone: '+91 22 6218 1818',
    industry: 'Paints & Coatings',
    expectedRevenue: 2100000,
  },
  {
    companyName: 'UltraTech Cement Ltd',
    contactPerson: 'Manoj Tiwari',
    email: 'manoj.tiwari@ultratechcement.com',
    phone: '+91 22 6692 8000',
    industry: 'Cement Manufacturing',
    expectedRevenue: 5800000,
  },
  {
    companyName: 'Godrej Industries Ltd',
    contactPerson: 'Kavita Shah',
    email: 'kavita.shah@godrej.com',
    phone: '+91 22 2518 8010',
    industry: 'Diversified Manufacturing',
    expectedRevenue: 3700000,
  },
  {
    companyName: 'Thermax Ltd',
    contactPerson: 'Ajay Deshpande',
    email: 'ajay.deshpande@thermaxglobal.com',
    phone: '+91 20 2540 3822',
    industry: 'Energy & Environment',
    expectedRevenue: 4100000,
  },
  {
    companyName: 'Kirloskar Brothers Ltd',
    contactPerson: 'Sanjay Kirloskar',
    email: 'sanjay@kbl.co.in',
    phone: '+91 20 2444 0770',
    industry: 'Pumps & Valves',
    expectedRevenue: 2800000,
  },
  {
    companyName: 'Mahindra CIE Automotive',
    contactPerson: 'Ravi Chandra',
    email: 'ravi.chandra@mahindracie.com',
    phone: '+91 20 2563 4000',
    industry: 'Automotive Components',
    expectedRevenue: 6200000,
  },
  {
    companyName: 'BEML Ltd',
    contactPerson: 'Nagesh Rao',
    email: 'nagesh.rao@beml.co.in',
    phone: '+91 80 2296 3280',
    industry: 'Heavy Equipment',
    expectedRevenue: 7500000,
  },
  {
    companyName: 'JSW Steel Ltd',
    contactPerson: 'Vinod Agarwal',
    email: 'vinod.agarwal@jsw.in',
    phone: '+91 22 4286 1000',
    industry: 'Steel Manufacturing',
    expectedRevenue: 9200000,
  },
  {
    companyName: 'Hindalco Industries Ltd',
    contactPerson: 'Prakash Sharma',
    email: 'prakash.sharma@adityabirla.com',
    phone: '+91 22 6861 7000',
    industry: 'Aluminium & Copper',
    expectedRevenue: 5500000,
  },
  {
    companyName: 'Grasim Industries Ltd',
    contactPerson: 'Aniket Bhosale',
    email: 'aniket.bhosale@grasim.com',
    phone: '+91 22 6652 5000',
    industry: 'Textiles & Chemicals',
    expectedRevenue: 3100000,
  },
  {
    companyName: 'Siemens India Ltd',
    contactPerson: 'Hans Mueller',
    email: 'hans.mueller@siemens.com',
    phone: '+91 22 3967 7000',
    industry: 'Electrical Equipment',
    expectedRevenue: 11000000,
  },
  {
    companyName: 'ABB India Ltd',
    contactPerson: 'Rajendra Prasad',
    email: 'rajendra.prasad@in.abb.com',
    phone: '+91 80 2294 9150',
    industry: 'Power & Automation',
    expectedRevenue: 8800000,
  },
  {
    companyName: 'Bajaj Auto Ltd',
    contactPerson: 'Nitin Bajaj',
    email: 'nitin.bajaj@bajajauto.co.in',
    phone: '+91 20 2740 6161',
    industry: 'Automobile Manufacturing',
    expectedRevenue: 4200000,
  },
  {
    companyName: 'Cummins India Ltd',
    contactPerson: 'Ashwini Deshpande',
    email: 'ashwini.deshpande@cummins.com',
    phone: '+91 20 2538 2000',
    industry: 'Diesel Engines',
    expectedRevenue: 5100000,
  },
  {
    companyName: 'Bosch India Ltd',
    contactPerson: 'Soumya Nagpal',
    email: 'soumya.nagpal@in.bosch.com',
    phone: '+91 80 2299 2220',
    industry: 'Auto Components & Technology',
    expectedRevenue: 7600000,
  },
  {
    companyName: 'Havells India Ltd',
    contactPerson: 'Anil Rai Gupta',
    email: 'anil.gupta@havells.com',
    phone: '+91 120 407 1000',
    industry: 'Electrical Equipment',
    expectedRevenue: 3400000,
  },
  {
    companyName: 'Titan Company Ltd',
    contactPerson: 'Meera Krishnan',
    email: 'meera.krishnan@titan.co.in',
    phone: '+91 80 6660 9090',
    industry: 'Precision Manufacturing',
    expectedRevenue: 2600000,
  },
  {
    companyName: 'Amara Raja Batteries',
    contactPerson: 'Jayadev Galla',
    email: 'jayadev@amararaja.com',
    phone: '+91 40 2344 4999',
    industry: 'Battery Manufacturing',
    expectedRevenue: 4800000,
  },
  {
    companyName: 'Ashok Leyland Ltd',
    contactPerson: 'Dheeraj Hinduja',
    email: 'dheeraj@ashokleyland.com',
    phone: '+91 44 2220 6000',
    industry: 'Commercial Vehicles',
    expectedRevenue: 6700000,
  },
  {
    companyName: 'Crompton Greaves',
    contactPerson: 'Sandeep Mathur',
    email: 'sandeep.mathur@cgglobal.com',
    phone: '+91 22 6761 4444',
    industry: 'Electrical Equipment',
    expectedRevenue: 3900000,
  },
  {
    companyName: 'Sundaram Fasteners',
    contactPerson: 'Arathi Krishna',
    email: 'arathi@sundaramfasteners.com',
    phone: '+91 44 2852 3735',
    industry: 'Fasteners & Precision Parts',
    expectedRevenue: 2300000,
  },
  {
    companyName: 'Elgi Equipments Ltd',
    contactPerson: 'Jairam Varadaraj',
    email: 'jairam@elgi.com',
    phone: '+91 422 258 9555',
    industry: 'Compressors & Equipment',
    expectedRevenue: 3600000,
  },
  {
    companyName: 'Finolex Cables Ltd',
    contactPerson: 'Ratnakar Barve',
    email: 'ratnakar.barve@finolex.com',
    phone: '+91 20 2720 6200',
    industry: 'Cable Manufacturing',
    expectedRevenue: 2900000,
  },
  {
    companyName: 'Schaeffler India Ltd',
    contactPerson: 'Harsha Kadam',
    email: 'harsha.kadam@schaeffler.com',
    phone: '+91 20 6819 4000',
    industry: 'Bearings & Automotive',
    expectedRevenue: 5300000,
  },
  {
    companyName: 'Kennametal India Ltd',
    contactPerson: 'Vijaykrishnan Venkatesan',
    email: 'vijay.v@kennametal.com',
    phone: '+91 80 2219 8444',
    industry: 'Cutting Tools',
    expectedRevenue: 1800000,
  },
  {
    companyName: 'Praj Industries Ltd',
    contactPerson: 'Shishir Joshipura',
    email: 'shishir@praj.net',
    phone: '+91 20 2580 2222',
    industry: 'Biotech & Engineering',
    expectedRevenue: 4400000,
  },
  {
    companyName: 'Voltas Ltd',
    contactPerson: 'Pradeep Bakshi',
    email: 'pradeep.bakshi@voltas.com',
    phone: '+91 22 6665 6300',
    industry: 'Engineering & HVAC',
    expectedRevenue: 3500000,
  },
  {
    companyName: 'Grindwell Norton Ltd',
    contactPerson: 'Anand Mahajan',
    email: 'anand.mahajan@saint-gobain.com',
    phone: '+91 22 6128 8000',
    industry: 'Abrasives & Ceramics',
    expectedRevenue: 2700000,
  },
  {
    companyName: 'Carborundum Universal',
    contactPerson: 'Sridharan Rangarajan',
    email: 'sridharan@cumi.murugappa.com',
    phone: '+91 44 2228 6789',
    industry: 'Abrasives & Industrial Ceramics',
    expectedRevenue: 3100000,
  },
  {
    companyName: 'Graphite India Ltd',
    contactPerson: 'Kulbhushan Khanna',
    email: 'kulbhushan@graphiteindia.com',
    phone: '+91 33 2248 7406',
    industry: 'Graphite Electrodes',
    expectedRevenue: 5600000,
  },
  {
    companyName: 'Triveni Turbine Ltd',
    contactPerson: 'Dhruv Sawhney',
    email: 'dhruv@triveni.com',
    phone: '+91 80 2297 1045',
    industry: 'Steam Turbines',
    expectedRevenue: 4900000,
  },
  {
    companyName: 'KSB Ltd India',
    contactPerson: 'Farrokh Bhathena',
    email: 'farrokh.bhathena@ksb.com',
    phone: '+91 20 2710 1000',
    industry: 'Pumps & Valves',
    expectedRevenue: 3800000,
  },
  {
    companyName: 'SKF India Ltd',
    contactPerson: 'Manish Bhatnagar',
    email: 'manish.bhatnagar@skf.com',
    phone: '+91 22 6633 7777',
    industry: 'Bearings Manufacturing',
    expectedRevenue: 4300000,
  },
  {
    companyName: 'Timken India Ltd',
    contactPerson: 'Sanjay Koul',
    email: 'sanjay.koul@timken.com',
    phone: '+91 20 6629 0550',
    industry: 'Bearings & Power Transmission',
    expectedRevenue: 3200000,
  },
  {
    companyName: 'AIA Engineering Ltd',
    contactPerson: 'Bhadresh Shah',
    email: 'bhadresh@aiaengineering.com',
    phone: '+91 79 2582 5000',
    industry: 'Mining Equipment',
    expectedRevenue: 5100000,
  },
  {
    companyName: 'Thermax Babcock & Wilcox',
    contactPerson: 'Meher Pudumjee',
    email: 'meher.pudumjee@tbwes.com',
    phone: '+91 20 6618 1000',
    industry: 'Boilers & Power',
    expectedRevenue: 7200000,
  },
  {
    companyName: 'Bharat Electronics Ltd',
    contactPerson: 'Dinesh Batra',
    email: 'dinesh.batra@bel.co.in',
    phone: '+91 80 2503 9300',
    industry: 'Defence Electronics',
    expectedRevenue: 9800000,
  },
  {
    companyName: 'HMT Machine Tools',
    contactPerson: 'Girish Kelkar',
    email: 'girish.kelkar@hmtindia.com',
    phone: '+91 80 2258 4643',
    industry: 'Machine Tools',
    expectedRevenue: 2400000,
  },
  {
    companyName: 'Mazagon Dock Shipbuilders',
    contactPerson: 'Narayan Prasad',
    email: 'narayan.prasad@mazdock.com',
    phone: '+91 22 2376 3252',
    industry: 'Shipbuilding',
    expectedRevenue: 12000000,
  },
  {
    companyName: 'Cochin Shipyard Ltd',
    contactPerson: 'Madhu Nair',
    email: 'madhu.nair@cochinshipyard.com',
    phone: '+91 484 250 1100',
    industry: 'Shipbuilding & Repair',
    expectedRevenue: 8500000,
  },
  {
    companyName: 'Garden Reach Shipbuilders',
    contactPerson: 'Sanjib Mitra',
    email: 'sanjib.mitra@grse.co.in',
    phone: '+91 33 2469 5012',
    industry: 'Defence Shipbuilding',
    expectedRevenue: 7100000,
  },
  {
    companyName: 'ISGEC Heavy Engineering',
    contactPerson: 'Aditya Puri',
    email: 'aditya.puri@isgec.com',
    phone: '+91 120 410 9800',
    industry: 'Heavy Engineering',
    expectedRevenue: 5400000,
  },
  {
    companyName: 'Walchandnagar Industries',
    contactPerson: 'Chirag Doshi',
    email: 'chirag.doshi@walchand.com',
    phone: '+91 20 2553 0210',
    industry: 'Capital Goods',
    expectedRevenue: 3300000,
  },
  {
    companyName: 'Bharat Heavy Electricals',
    contactPerson: 'K Nalin',
    email: 'k.nalin@bhel.in',
    phone: '+91 11 2610 1422',
    industry: 'Power Equipment',
    expectedRevenue: 15000000,
  },
  {
    companyName: 'Texmaco Rail & Engineering',
    contactPerson: 'Saroj Poddar',
    email: 'saroj.poddar@texmaco.in',
    phone: '+91 33 2248 9592',
    industry: 'Railway Equipment',
    expectedRevenue: 6300000,
  },
  {
    companyName: 'DCM Shriram Industries',
    contactPerson: 'Ajay Shriram',
    email: 'ajay.shriram@dcmshriram.com',
    phone: '+91 11 2371 8090',
    industry: 'Chemicals & Sugar',
    expectedRevenue: 2100000,
  },
  {
    companyName: 'Varroc Engineering Ltd',
    contactPerson: 'Tarang Jain',
    email: 'tarang.jain@varroc.com',
    phone: '+91 20 6764 4000',
    industry: 'Auto Components',
    expectedRevenue: 3800000,
  },
  {
    companyName: 'Minda Industries Ltd',
    contactPerson: 'Sunil Bohra',
    email: 'sunil.bohra@minda.co.in',
    phone: '+91 124 473 5100',
    industry: 'Auto Components',
    expectedRevenue: 4600000,
  },
  {
    companyName: 'Motherson Sumi Systems',
    contactPerson: 'Vivek Chaand Sehgal',
    email: 'vivek@motherson.com',
    phone: '+91 120 674 4500',
    industry: 'Auto Components & Wiring',
    expectedRevenue: 7800000,
  },
  {
    companyName: 'Wabco India Ltd',
    contactPerson: 'P Kaniappan',
    email: 'kaniappan@wabco-auto.com',
    phone: '+91 44 2232 2000',
    industry: 'Commercial Vehicle Technology',
    expectedRevenue: 3500000,
  },
  {
    companyName: 'Honeywell Automation India',
    contactPerson: 'Ashish Gaikwad',
    email: 'ashish.gaikwad@honeywell.com',
    phone: '+91 20 6603 9400',
    industry: 'Industrial Automation',
    expectedRevenue: 8900000,
  },
];

const taskTemplates = [
  'Schedule product demo',
  'Prepare technical proposal',
  'Send quotation',
  'Follow up on pricing discussion',
  'Conduct factory visit',
  'Review contract terms',
  'Prepare presentation for management',
  'Arrange sample delivery',
  'Schedule quality audit',
  'Negotiate payment terms',
  'Submit tender documents',
  'Coordinate with engineering team',
  'Draft service agreement',
  'Organize plant tour',
  'Prepare competitive analysis',
  'Follow up on material samples',
  'Update CRM records',
  'Review delivery schedule',
  'Arrange certification documents',
  'Prepare after-sales service plan',
  'Schedule technical training',
  'Follow up on purchase order',
  'Review warranty terms',
  'Coordinate with logistics team',
  'Prepare installation plan',
  'Submit compliance documents',
  'Follow up on invoice payment',
  'Arrange third-party inspection',
  'Prepare monthly sales report',
  'Review spare parts availability',
  'Schedule maintenance training',
  'Follow up on RFQ response',
  'Organize customer feedback session',
  'Prepare capacity planning report',
  'Submit environmental clearance docs',
];

const noteTexts = [
  'Initial discussion went well. Client showed interest in our premium product line.',
  'Sent product catalog and pricing sheet via email. Awaiting response.',
  'Client requested customization options. Need to coordinate with engineering.',
  'Conducted factory visit. Client was impressed with our manufacturing capabilities.',
  'Price negotiation in progress. Client comparing with 2 other vendors.',
  'Technical specifications shared. Scheduling a demo next week.',
  'Client wants to start with a trial order. Preparing sample batch.',
  'Follow-up call completed. Decision expected by end of month.',
  'Meeting with procurement head scheduled for next Thursday.',
  'Client has budget constraints. Exploring phased delivery options.',
  'Quality certification documents submitted. Awaiting verification.',
  'Competitive bid received. Need to revise our offer.',
  'Contract review in progress with legal team on both sides.',
  'Client visited our Pune facility. Very positive feedback.',
  'Payment terms discussed - Net 60 agreed upon.',
  'Technical team addressed all queries. Moving forward with proposal.',
  'Annual maintenance contract discussion initiated.',
  'Client expanding operations. Potential for larger order next quarter.',
  'Supply chain concerns raised. Assured 4-week delivery timeline.',
  'Finalizing specifications. PO expected within 2 weeks.',
];

// ============================================================
// SEED FUNCTION
// ============================================================

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear all collections
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ All collections cleared\n');

    // ---- Create Users ----
    console.log('👤 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    const admin = createdUsers.find((u) => u.role === 'admin');
    const managers = createdUsers.filter((u) => u.role === 'manager');
    const bdas = createdUsers.filter((u) => u.role === 'bda');

    console.log(`   Admin: ${admin.name} (${admin.email})`);
    managers.forEach((m) => console.log(`   Manager: ${m.name} (${m.email})`));
    bdas.forEach((b) => console.log(`   BDA: ${b.name} (${b.email})`));
    console.log();

    // ---- Create Leads ----
    console.log('🏢 Creating leads...');
    const leadsToCreate = leadTemplates.map((template, index) => {
      const bdaIndex = index % bdas.length;
      const statusIndex = index % statuses.length;
      const sourceIndex = index % leadSources.length;
      const priorityIndex = index % priorities.length;

      // Create follow-up dates spread over next 30 days
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + Math.floor(Math.random() * 30) - 5);

      // Spread creation dates over last 6 months
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 180));

      return {
        ...template,
        leadSource: leadSources[sourceIndex],
        status: statuses[statusIndex],
        priority: priorities[priorityIndex],
        assignedTo: bdas[bdaIndex]._id,
        followUpDate,
        createdAt,
        updatedAt: createdAt,
        notes: [],
      };
    });

    const createdLeads = await Lead.insertMany(leadsToCreate);
    console.log(`✅ Created ${createdLeads.length} leads\n`);

    // ---- Add Notes to Leads ----
    console.log('📝 Adding notes to leads...');
    let notesAdded = 0;
    for (let i = 0; i < createdLeads.length; i++) {
      const lead = await Lead.findById(createdLeads[i]._id);
      const numNotes = Math.floor(Math.random() * 3) + 1; // 1-3 notes per lead

      for (let j = 0; j < numNotes; j++) {
        const noteIndex = (i + j) % noteTexts.length;
        const bdaIndex = i % bdas.length;
        const noteDate = new Date(lead.createdAt);
        noteDate.setDate(noteDate.getDate() + j * 3 + Math.floor(Math.random() * 5));

        lead.notes.push({
          text: noteTexts[noteIndex],
          createdBy: bdas[bdaIndex]._id,
          createdAt: noteDate,
        });
        notesAdded++;
      }
      await lead.save();
    }
    console.log(`✅ Added ${notesAdded} notes across all leads\n`);

    // ---- Create Tasks ----
    console.log('📋 Creating tasks...');
    const taskStatuses = ['Pending', 'InProgress', 'Completed', 'Cancelled'];
    const taskPriorities = ['Low', 'Medium', 'High', 'Urgent'];

    const tasksToCreate = taskTemplates.map((title, index) => {
      const bdaIndex = index % bdas.length;
      const leadIndex = index % createdLeads.length;
      const statusIdx = index % taskStatuses.length;
      const priorityIdx = index % taskPriorities.length;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 10);

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      const task = {
        title,
        description: `${title} for ${createdLeads[leadIndex].companyName}. Please complete by the due date.`,
        assignedTo: bdas[bdaIndex]._id,
        relatedLead: createdLeads[leadIndex]._id,
        dueDate,
        priority: taskPriorities[priorityIdx],
        status: taskStatuses[statusIdx],
        createdAt,
        updatedAt: createdAt,
      };

      // Set completedAt for completed tasks
      if (task.status === 'Completed') {
        const completedAt = new Date(createdAt);
        completedAt.setDate(completedAt.getDate() + Math.floor(Math.random() * 7) + 1);
        task.completedAt = completedAt;
      }

      return task;
    });

    const createdTasks = await Task.insertMany(tasksToCreate);
    console.log(`✅ Created ${createdTasks.length} tasks\n`);

    // ---- Create Activity Logs ----
    console.log('📊 Creating activity logs...');
    const activities = [];

    // Login activities
    for (const user of createdUsers) {
      const loginDate = new Date();
      loginDate.setDate(loginDate.getDate() - Math.floor(Math.random() * 7));
      activities.push({
        user: user._id,
        type: 'login',
        description: `${user.name} logged in`,
        createdAt: loginDate,
      });
    }

    // Lead created activities
    for (const lead of createdLeads) {
      activities.push({
        user: lead.assignedTo,
        type: 'lead_created',
        description: `Created lead for ${lead.companyName}`,
        relatedLead: lead._id,
        createdAt: lead.createdAt,
      });
    }

    // Lead status changed activities (for non-New leads)
    for (const lead of createdLeads.filter((l) => l.status !== 'New')) {
      const changeDate = new Date(lead.createdAt);
      changeDate.setDate(changeDate.getDate() + Math.floor(Math.random() * 14) + 1);
      activities.push({
        user: lead.assignedTo,
        type: 'lead_status_changed',
        description: `Changed ${lead.companyName} status to ${lead.status}`,
        relatedLead: lead._id,
        metadata: { from: 'New', to: lead.status },
        createdAt: changeDate,
      });
    }

    // Task created activities
    for (const task of createdTasks) {
      activities.push({
        user: task.assignedTo,
        type: 'task_created',
        description: `Created task: ${task.title}`,
        relatedTask: task._id,
        relatedLead: task.relatedLead,
        createdAt: task.createdAt,
      });
    }

    // Task completed activities
    for (const task of createdTasks.filter((t) => t.status === 'Completed')) {
      activities.push({
        user: task.assignedTo,
        type: 'task_completed',
        description: `Completed task: ${task.title}`,
        relatedTask: task._id,
        relatedLead: task.relatedLead,
        createdAt: task.completedAt,
      });
    }

    // Note added activities
    for (let i = 0; i < 20; i++) {
      const leadIndex = i % createdLeads.length;
      const bdaIndex = i % bdas.length;
      const noteDate = new Date();
      noteDate.setDate(noteDate.getDate() - Math.floor(Math.random() * 30));
      activities.push({
        user: bdas[bdaIndex]._id,
        type: 'note_added',
        description: `Added note to lead: ${createdLeads[leadIndex].companyName}`,
        relatedLead: createdLeads[leadIndex]._id,
        createdAt: noteDate,
      });
    }

    const createdActivities = await Activity.insertMany(activities);
    console.log(`✅ Created ${createdActivities.length} activity logs\n`);

    // ---- Create Notifications ----
    console.log('🔔 Creating notifications...');
    const notifications = [];

    // Lead assignment notifications
    for (let i = 0; i < 20; i++) {
      const leadIndex = i % createdLeads.length;
      const lead = createdLeads[leadIndex];
      const notifDate = new Date(lead.createdAt);
      notifDate.setHours(notifDate.getHours() + 1);
      notifications.push({
        user: lead.assignedTo,
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.companyName}`,
        type: 'lead_assigned',
        isRead: Math.random() > 0.4,
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
        createdAt: notifDate,
      });
    }

    // Task assignment notifications
    for (let i = 0; i < 15; i++) {
      const taskIndex = i % createdTasks.length;
      const task = createdTasks[taskIndex];
      const notifDate = new Date(task.createdAt);
      notifDate.setHours(notifDate.getHours() + 1);
      notifications.push({
        user: task.assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        type: 'task_assigned',
        isRead: Math.random() > 0.5,
        relatedEntity: task._id,
        relatedEntityType: 'Task',
        createdAt: notifDate,
      });
    }

    // Follow-up reminder notifications
    for (let i = 0; i < 10; i++) {
      const leadIndex = i % createdLeads.length;
      const lead = createdLeads[leadIndex];
      notifications.push({
        user: lead.assignedTo,
        title: 'Follow-up Reminder',
        message: `Reminder: Follow up with ${lead.companyName} - ${lead.contactPerson}`,
        type: 'follow_up_reminder',
        isRead: false,
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
      });
    }

    // Deal won notifications
    const wonLeads = createdLeads.filter((l) => l.status === 'Won');
    for (const lead of wonLeads) {
      notifications.push({
        user: lead.assignedTo,
        title: 'Deal Won! 🎉',
        message: `Congratulations! Deal with ${lead.companyName} has been won! Revenue: ₹${lead.expectedRevenue.toLocaleString()}`,
        type: 'deal_won',
        isRead: Math.random() > 0.3,
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
      });
    }

    // Deal lost notifications
    const lostLeads = createdLeads.filter((l) => l.status === 'Lost');
    for (const lead of lostLeads) {
      notifications.push({
        user: lead.assignedTo,
        title: 'Deal Lost',
        message: `Deal with ${lead.companyName} has been marked as lost`,
        type: 'deal_lost',
        isRead: true,
        relatedEntity: lead._id,
        relatedEntityType: 'Lead',
      });
    }

    // System notifications
    for (const bda of bdas) {
      notifications.push({
        user: bda._id,
        title: 'Welcome to Manufacturing CRM',
        message: 'Welcome aboard! Start by checking your assigned leads and tasks.',
        type: 'system',
        isRead: Math.random() > 0.5,
      });
    }

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications\n`);

    // ---- Summary ----
    console.log('═══════════════════════════════════════════');
    console.log('   🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log(`   Users:          ${createdUsers.length}`);
    console.log(`   Leads:          ${createdLeads.length}`);
    console.log(`   Notes:          ${notesAdded}`);
    console.log(`   Tasks:          ${createdTasks.length}`);
    console.log(`   Activities:     ${createdActivities.length}`);
    console.log(`   Notifications:  ${createdNotifications.length}`);
    console.log('═══════════════════════════════════════════');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin:   admin@mfgcrm.com / admin123');
    console.log('   Manager: priya.sharma@mfgcrm.com / password123');
    console.log('   BDA:     ananya.desai@mfgcrm.com / password123');
    console.log('═══════════════════════════════════════════\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
