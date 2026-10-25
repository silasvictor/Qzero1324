"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding QueueZero (Q-Zero) Campus Database...');
    // Clean existing records
    await prisma.verificationRecord.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.printOrder.deleteMany();
    await prisma.pickupSlot.deleteMany();
    await prisma.printSetting.deleteMany();
    await prisma.document.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.adminAuditLog.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.kiosk.deleteMany();
    await prisma.user.deleteMany();
    const salt = await bcryptjs_1.default.genSalt(10);
    const studentPassword = await bcryptjs_1.default.hash('password123', salt);
    const adminPassword = await bcryptjs_1.default.hash('admin123', salt);
    const operatorPassword = await bcryptjs_1.default.hash('operator123', salt);
    // 1. Create Demo Users
    const student = await prisma.user.create({
        data: {
            email: 'nischal@campus.edu',
            passwordHash: studentPassword,
            role: 'STUDENT',
            name: 'Nischal Chowdary',
            rollNumber: '2614213032',
            department: 'Computer Science & Engineering',
            phone: '+91 9848022338',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            studentProfile: {
                create: {
                    universityCardId: 'UCID-2614213032',
                    year: '3rd Year B.Tech',
                    balance: 245.50,
                    loyaltyPoints: 180,
                    defaultDuplex: true,
                    defaultColor: false
                }
            }
        }
    });
    const admin = await prisma.user.create({
        data: {
            email: 'admin@campus.edu',
            passwordHash: adminPassword,
            role: 'ADMIN',
            name: 'Dr. A. Sharma',
            rollNumber: 'EMP-ADM-042',
            department: 'Campus IT & Auxiliary Services',
            phone: '+91 9440112233'
        }
    });
    const operator = await prisma.user.create({
        data: {
            email: 'operator@campus.edu',
            passwordHash: operatorPassword,
            role: 'OPERATOR',
            name: 'Ramesh Kumar',
            rollNumber: 'EMP-OPS-108',
            department: 'Central Print Hub Fleet Operations',
            phone: '+91 9988776655'
        }
    });
    console.log('✅ Demo Users created:');
    console.log('   - Student: nischal@campus.edu / password123');
    console.log('   - Admin: admin@campus.edu / admin123');
    console.log('   - Operator: operator@campus.edu / operator123');
    // 2. Create Campus Kiosks (Demonstration Campus Coordinates)
    const kiosksData = [
        {
            name: 'Central Campus Kiosk',
            campusCode: 'K-CENTRAL',
            location: 'Student Activity Center, Ground Floor Foyer',
            description: 'Primary high-speed duplex print hub with 2 heavy-duty laser units',
            latitude: 16.5062,
            longitude: 80.6480,
            status: 'ONLINE',
            paperLevelPercent: 94,
            tonerLevelPercent: 88,
            queueDepth: 2,
            ppmSpeed: 45,
            activeQueueCapacity: 50,
            operatorName: 'Ramesh Kumar (Desk A)'
        },
        {
            name: 'Library Kiosk',
            campusCode: 'K-LIB',
            location: 'Central Library, 2nd Floor Digital Resource Center',
            description: 'Quiet print zone with automated smart envelope dispenser',
            latitude: 16.5075,
            longitude: 80.6495,
            status: 'ONLINE',
            paperLevelPercent: 82,
            tonerLevelPercent: 79,
            queueDepth: 1,
            ppmSpeed: 35,
            activeQueueCapacity: 30,
            operatorName: 'Priya V. (Library Desk)'
        },
        {
            name: 'Hostel Block A Kiosk',
            campusCode: 'K-HST-A',
            location: 'Boys Hostel A, Main Lounge Entrance',
            description: '24/7 autonomous quick-scan release terminal',
            latitude: 16.5048,
            longitude: 80.6470,
            status: 'ONLINE',
            paperLevelPercent: 68,
            tonerLevelPercent: 62,
            queueDepth: 3,
            ppmSpeed: 30,
            activeQueueCapacity: 25,
            operatorName: 'Hostel Warden Desk'
        },
        {
            name: 'Hostel Block B Kiosk',
            campusCode: 'K-HST-B',
            location: 'Girls Hostel B, Common Recreation Hall',
            description: '24/7 express pickup lockers with barcode scanner',
            latitude: 16.5042,
            longitude: 80.6465,
            status: 'BUSY',
            paperLevelPercent: 78,
            tonerLevelPercent: 71,
            queueDepth: 5,
            ppmSpeed: 30,
            activeQueueCapacity: 25,
            operatorName: 'Security Desk B'
        },
        {
            name: 'Academic Block Kiosk',
            campusCode: 'K-ACAD',
            location: 'Engineering Department, West Wing Level 1',
            description: 'Project reports & thesis high-volume binder station',
            latitude: 16.5085,
            longitude: 80.6510,
            status: 'ONLINE',
            paperLevelPercent: 98,
            tonerLevelPercent: 95,
            queueDepth: 0,
            ppmSpeed: 50,
            activeQueueCapacity: 40,
            operatorName: 'CSE Lab Tech'
        }
    ];
    const kiosks = [];
    for (const k of kiosksData) {
        const createdKiosk = await prisma.kiosk.create({ data: k });
        kiosks.push(createdKiosk);
    }
    console.log(`✅ Created ${kiosks.length} Campus Kiosks`);
    // 3. Create Pickup Slots for Kiosks
    const now = new Date();
    const centralKiosk = kiosks[0];
    for (const kiosk of kiosks) {
        for (let offset = 0; offset < 3; offset++) {
            const slotDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
            for (const hour of [9, 11, 14, 16, 17]) {
                await prisma.pickupSlot.create({
                    data: {
                        kioskId: kiosk.id,
                        startTime: new Date(slotDay.getFullYear(), slotDay.getMonth(), slotDay.getDate(), hour, 0, 0),
                        endTime: new Date(slotDay.getFullYear(), slotDay.getMonth(), slotDay.getDate(), hour, 45, 0),
                        capacity: 10,
                        bookedCount: Math.floor(Math.random() * 5),
                        isAvailable: true
                    }
                });
            }
        }
    }
    // 4. Create Sample Documents for Student
    const doc1 = await prisma.document.create({
        data: {
            userId: student.id,
            fileName: 'ai_systems_lab_manual.pdf',
            originalName: 'AI_Systems_Lab_Manual_Final.pdf',
            fileSize: 2458291,
            fileType: 'application/pdf',
            pageCount: 14,
            isColorDetected: false,
            fileUrl: '/uploads/sample_lab_manual.pdf',
            printSettings: {
                create: {
                    colorMode: 'BW',
                    duplexMode: 'DOUBLE',
                    paperSize: 'A4',
                    orientation: 'PORTRAIT',
                    pageRange: 'ALL',
                    oddEven: 'ALL',
                    copies: 1,
                    includeTrackingMargin: true,
                    bindingOption: 'CORNER_STAPLE',
                    calculatedPrice: 19.50
                }
            }
        },
        include: { printSettings: true }
    });
    const doc2 = await prisma.document.create({
        data: {
            userId: student.id,
            fileName: 'operating_systems_notes.pdf',
            originalName: 'OS_Module_4_Deadlocks_Notes.pdf',
            fileSize: 1540112,
            fileType: 'application/pdf',
            pageCount: 8,
            isColorDetected: true,
            fileUrl: '/uploads/sample_os_notes.pdf',
            printSettings: {
                create: {
                    colorMode: 'COLOR',
                    duplexMode: 'SINGLE',
                    paperSize: 'A4',
                    orientation: 'PORTRAIT',
                    pageRange: 'ALL',
                    oddEven: 'ALL',
                    copies: 1,
                    includeTrackingMargin: true,
                    bindingOption: 'NONE',
                    calculatedPrice: 56.00
                }
            }
        },
        include: { printSettings: true }
    });
    const doc3 = await prisma.document.create({
        data: {
            userId: student.id,
            fileName: 'intermediate_marks_memo.pdf',
            originalName: 'Pass_Certificate_Memorandum_Marks.pdf',
            fileSize: 845210,
            fileType: 'application/pdf',
            pageCount: 1,
            isColorDetected: true,
            fileUrl: '/uploads/sample_marks_memo.pdf',
            printSettings: {
                create: {
                    colorMode: 'COLOR',
                    duplexMode: 'SINGLE',
                    paperSize: 'A4',
                    orientation: 'PORTRAIT',
                    pageRange: '1',
                    oddEven: 'ALL',
                    copies: 2,
                    includeTrackingMargin: true,
                    bindingOption: 'NONE',
                    calculatedPrice: 14.00
                }
            }
        },
        include: { printSettings: true }
    });
    // 5. Create Realistic Sample Orders
    // Order 1: READY_FOR_PICKUP (Matches prompt example 8XUI-Z123)
    const order1 = await prisma.printOrder.create({
        data: {
            trackingCode: '8XUI-Z123',
            userId: student.id,
            documentId: doc1.id,
            printSettingsId: doc1.printSettings.id,
            kioskId: centralKiosk.id,
            printMode: 'SCHEDULED',
            status: 'READY_FOR_PICKUP',
            priorityScore: 3.82,
            estimatedPrintTimeSec: 24,
            totalPages: 14,
            amount: 19.50,
            currency: 'INR',
            pickupWindowStart: new Date(now.getTime() - 10 * 60 * 1000),
            pickupWindowEnd: new Date(now.getTime() + 50 * 60 * 1000),
            payment: {
                create: {
                    userId: student.id,
                    amount: 19.50,
                    currency: 'INR',
                    method: 'WALLET',
                    status: 'SUCCESS',
                    transactionId: 'TXN-WAL-994821',
                    receiptNumber: 'RCP-88412-01'
                }
            }
        }
    });
    // Order 2: PRINTING
    await prisma.printOrder.create({
        data: {
            trackingCode: '4TRK-B981',
            userId: student.id,
            documentId: doc2.id,
            printSettingsId: doc2.printSettings.id,
            kioskId: kiosks[1].id, // Library kiosk
            printMode: 'INSTANT',
            status: 'PRINTING',
            priorityScore: 5.40,
            estimatedPrintTimeSec: 32,
            totalPages: 8,
            amount: 56.00,
            currency: 'INR',
            pickupWindowStart: new Date(now.getTime() + 15 * 60 * 1000),
            pickupWindowEnd: new Date(now.getTime() + 60 * 60 * 1000),
            payment: {
                create: {
                    userId: student.id,
                    amount: 56.00,
                    currency: 'INR',
                    method: 'RAZORPAY_SANDBOX',
                    status: 'SUCCESS',
                    transactionId: 'TXN-RZP-339182',
                    receiptNumber: 'RCP-88412-02'
                }
            }
        }
    });
    // Order 3: COLLECTED
    await prisma.printOrder.create({
        data: {
            trackingCode: '9MNQ-K412',
            userId: student.id,
            documentId: doc3.id,
            printSettingsId: doc3.printSettings.id,
            kioskId: centralKiosk.id,
            printMode: 'SCHEDULED',
            status: 'COLLECTED',
            priorityScore: 1.25,
            estimatedPrintTimeSec: 12,
            totalPages: 2,
            amount: 14.00,
            currency: 'INR',
            collectedAt: new Date(now.getTime() - 24 * 3600 * 1000),
            payment: {
                create: {
                    userId: student.id,
                    amount: 14.00,
                    currency: 'INR',
                    method: 'WALLET',
                    status: 'SUCCESS',
                    transactionId: 'TXN-WAL-772619',
                    receiptNumber: 'RCP-88412-03'
                }
            },
            verificationRecord: {
                create: {
                    operatorId: operator.id,
                    studentRollNoVerified: true,
                    cardVerified: true,
                    envelopeCodeVerified: true,
                    otpVerified: false,
                    verificationNotes: 'Handover complete. Student ID 2614213032 confirmed.'
                }
            }
        }
    });
    // 6. Create Initial Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: student.id,
                title: 'Your Print Is Ready! 🎉',
                message: 'Order #8XUI-Z123 is printed and sealed at Central Campus Kiosk. Show your ID for quick collection.',
                type: 'READY_FOR_PICKUP',
                isRead: false,
                link: '/orders/8XUI-Z123'
            },
            {
                userId: student.id,
                title: 'Hardware Printing Started 🖨️',
                message: 'Order #4TRK-B981 is being printed at Library Kiosk (High Priority Mode).',
                type: 'ORDER_CONFIRMED',
                isRead: false,
                link: '/orders/4TRK-B981'
            },
            {
                userId: student.id,
                title: 'Payment Successful 💳',
                message: '₹19.50 deducted from your campus wallet for Order #8XUI-Z123.',
                type: 'PAYMENT_SUCCESS',
                isRead: true,
                link: '/wallet'
            },
            {
                userId: student.id,
                title: 'Welcome to QueueZero! 🚀',
                message: 'Say goodbye to campus print lines! You have ₹245.50 in your smart printing wallet.',
                type: 'SYSTEM',
                isRead: true,
                link: '/dashboard'
            }
        ]
    });
    console.log('✅ Sample Orders, Documents, and Notifications created!');
    console.log('🎉 Database seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
