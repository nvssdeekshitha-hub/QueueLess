import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Appointment from '../src/models/Appointment.js';
import QueueAudit from '../src/models/QueueAudit.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

const seedDatabase = async (closeConnection = true) => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Starting idempotent seed process...');

    // 1. Create or update Default Admin
    const adminEmail = 'admin@queueless.edu';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Dean of Student Affairs (Admin)',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
        department: 'Academic & Central Administration',
      });
      console.log(`[Seed] Created Administrator: ${admin.email}`);
    } else {
      console.log(`[Seed] Administrator exists: ${admin.email}`);
    }

    // 2. Create Staff Members
    const staffMembers = [
      {
        name: 'Prof. Ramesh Gupta',
        email: 'staff.records@queueless.edu',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'Academic Records',
        phone: '+91 98765 43210',
      },
      {
        name: 'Ms. Sunita Rao',
        email: 'staff.finance@queueless.edu',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'Accounts & Finance',
        phone: '+91 98765 43211',
      },
      {
        name: 'Mr. David Paul',
        email: 'staff.general@queueless.edu',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'General Affairs',
        phone: '+91 98765 43212',
      },
      {
        name: 'Dr. Anita Desai',
        email: 'staff.library@queueless.edu',
        password: 'StaffPassword123!',
        role: 'staff',
        department: 'Central Library',
        phone: '+91 98765 43213',
      },
    ];

    const staffMap = {};
    for (const s of staffMembers) {
      let existingStaff = await User.findOne({ email: s.email });
      if (!existingStaff) {
        existingStaff = await User.create(s);
        console.log(`[Seed] Created Staff: ${s.name} (${s.email})`);
      }
      staffMap[s.email] = existingStaff._id;
    }

    // 3. Create Sample Students
    const studentUsers = [
      {
        name: 'Deekshitha NVSS',
        email: 'student@queueless.edu',
        password: 'StudentPassword123!',
        role: 'student',
        studentId: '22CSE1042',
        department: 'Computer Science & Engineering',
        phone: '+91 91234 56789',
      },
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@queueless.edu',
        password: 'StudentPassword123!',
        role: 'student',
        studentId: '22CSE1088',
        department: 'Computer Science & Engineering',
        phone: '+91 91234 56790',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@queueless.edu',
        password: 'StudentPassword123!',
        role: 'student',
        studentId: '22ECE2014',
        department: 'Electronics & Communication',
        phone: '+91 91234 56791',
      },
      {
        name: 'Karan Verma',
        email: 'karan.verma@queueless.edu',
        password: 'StudentPassword123!',
        role: 'student',
        studentId: '23MEC3051',
        department: 'Mechanical Engineering',
        phone: '+91 91234 56792',
      },
    ];

    const studentMap = {};
    for (const st of studentUsers) {
      let student = await User.findOne({ email: st.email });
      if (!student) {
        student = await User.create(st);
        console.log(`[Seed] Created Student: ${st.name} (${st.email})`);
      }
      studentMap[st.email] = student._id;
    }

    // 4. Create Core Services
    const sampleServices = [
      {
        name: 'Certificates & Student Records',
        code: 'REC',
        description: 'Bonafide certificates, transcripts, migration letters, and degree verification requests.',
        category: 'Academic',
        counterName: 'Counter 1 (Academic Section)',
        estimatedDurationMin: 10,
        slotCapacity: 5,
        operatingHours: { start: '09:00', end: '16:30' },
        assignedStaff: [staffMap['staff.records@queueless.edu']],
        isActive: true,
      },
      {
        name: 'Fee & Scholarship Inquiries',
        code: 'FEE',
        description: 'Tuition fees receipt issuance, scholarship disbursement forms, fee dues, and refund processing.',
        category: 'Financial',
        counterName: 'Counter 2 (Accounts Section)',
        estimatedDurationMin: 15,
        slotCapacity: 4,
        operatingHours: { start: '09:30', end: '16:00' },
        assignedStaff: [staffMap['staff.finance@queueless.edu']],
        isActive: true,
      },
      {
        name: 'General Administration & ID Cards',
        code: 'ADM',
        description: 'New student ID card issuance, hostel allotments, transport passes, and general grievance redressal.',
        category: 'Administrative',
        counterName: 'Counter 3 (Admin Block)',
        estimatedDurationMin: 12,
        slotCapacity: 6,
        operatingHours: { start: '09:00', end: '17:00' },
        assignedStaff: [staffMap['staff.general@queueless.edu']],
        isActive: true,
      },
      {
        name: 'Library Circulation & Reference Services',
        code: 'LIB',
        description: 'Book reservations, overdue clearance, digital research access tokens, and study cubicle bookings.',
        category: 'Library',
        counterName: 'Counter 4 (Central Library)',
        estimatedDurationMin: 8,
        slotCapacity: 8,
        operatingHours: { start: '08:30', end: '18:00' },
        assignedStaff: [staffMap['staff.library@queueless.edu']],
        isActive: true,
      },
    ];

    const serviceMap = {};
    for (const s of sampleServices) {
      let existingService = await Service.findOne({ code: s.code });
      if (!existingService) {
        existingService = await Service.create(s);
        console.log(`[Seed] Created Service: ${s.name} [${s.code}]`);
      } else {
        // Update staff assignment
        existingService.assignedStaff = s.assignedStaff;
        await existingService.save();
      }
      serviceMap[s.code] = existingService;
    }

    // 5. Create Sample Appointments for Today and Previous Days
    const todayStr = new Date().toISOString().slice(0, 10);
    const recService = serviceMap['REC'];

    const existingAppointments = await Appointment.countDocuments({
      service: recService._id,
      appointmentDate: todayStr,
    });

    if (existingAppointments === 0) {
      console.log(`[Seed] Generating realistic sample appointments for today (${todayStr})...`);

      const sampleAppointments = [
        {
          bookingReference: 'QL-20261028-A01',
          user: studentMap['aarav.mehta@queueless.edu'],
          service: recService._id,
          appointmentDate: todayStr,
          timeSlot: '09:00 - 09:30',
          tokenNumber: 'REC-001',
          tokenSequence: 1,
          status: 'completed',
          notes: 'Requesting consolidated transcript for master applications.',
          bookedAt: new Date(Date.now() - 1000 * 60 * 180),
          calledAt: new Date(Date.now() - 1000 * 60 * 150),
          servingStartedAt: new Date(Date.now() - 1000 * 60 * 145),
          completedAt: new Date(Date.now() - 1000 * 60 * 135),
          servedBy: staffMap['staff.records@queueless.edu'],
        },
        {
          bookingReference: 'QL-20261028-B02',
          user: studentMap['priya.sharma@queueless.edu'],
          service: recService._id,
          appointmentDate: todayStr,
          timeSlot: '09:30 - 10:00',
          tokenNumber: 'REC-002',
          tokenSequence: 2,
          status: 'serving',
          notes: 'Bonafide certificate for passport verification.',
          bookedAt: new Date(Date.now() - 1000 * 60 * 120),
          calledAt: new Date(Date.now() - 1000 * 60 * 20),
          servingStartedAt: new Date(Date.now() - 1000 * 60 * 15),
          servedBy: staffMap['staff.records@queueless.edu'],
        },
        {
          bookingReference: 'QL-20261028-C03',
          user: studentMap['student@queueless.edu'],
          service: recService._id,
          appointmentDate: todayStr,
          timeSlot: '10:00 - 10:30',
          tokenNumber: 'REC-003',
          tokenSequence: 3,
          status: 'waiting',
          notes: 'Correction in father name on provisional certificate.',
          bookedAt: new Date(Date.now() - 1000 * 60 * 60),
          calledAt: new Date(Date.now() - 1000 * 60 * 5),
          servedBy: staffMap['staff.records@queueless.edu'],
        },
        {
          bookingReference: 'QL-20261028-D04',
          user: studentMap['karan.verma@queueless.edu'],
          service: recService._id,
          appointmentDate: todayStr,
          timeSlot: '10:00 - 10:30',
          tokenNumber: 'REC-004',
          tokenSequence: 4,
          status: 'booked',
          notes: 'Duplicate grade sheet request.',
          bookedAt: new Date(Date.now() - 1000 * 60 * 30),
        },
      ];

      for (const apt of sampleAppointments) {
        const createdApt = await Appointment.create(apt);
        await QueueAudit.create({
          appointment: createdApt._id,
          service: recService._id,
          tokenNumber: createdApt.tokenNumber,
          action: createdApt.status.toUpperCase(),
          newStatus: createdApt.status,
          performedBy: createdApt.user,
          notes: 'Seeded record',
        });
      }
      console.log(`[Seed] Seeded ${sampleAppointments.length} active queue entries.`);
    }

    console.log('[Seed] Database seeding completed successfully! ✨');
    console.log('\nDefault Test Accounts:');
    console.log('-----------------------------------------------------------');
    console.log('👤 Student: student@queueless.edu         | StudentPassword123!');
    console.log('👨‍💼 Staff:   staff.records@queueless.edu   | StaffPassword123!');
    console.log('👑 Admin:   admin@queueless.edu           | AdminPassword123!');
    console.log('-----------------------------------------------------------\n');
  } catch (error) {
    console.error('[Seed Error]:', error);
  } finally {
    if (closeConnection) {
      await disconnectDB();
      process.exit(0);
    }
  }
};

export default seedDatabase;

// Run directly if called as a script
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/seed.js')) {
  seedDatabase(true);
}
