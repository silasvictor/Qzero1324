import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbPrinters = [
  {
    name: 'CB North Printer',
    campusCode: 'VITAP-CB-NORTH',
    location: 'Around Central Block (CB), north side',
    description: 'Demo printer point approximately 100 meters north of Central Block.',
    latitude: 16.495428,
    longitude: 80.499389,
  },
  {
    name: 'CB East Printer',
    campusCode: 'VITAP-CB-EAST',
    location: 'Around Central Block (CB), east side',
    description: 'Demo printer point approximately 100 meters east of Central Block.',
    latitude: 16.494528,
    longitude: 80.500327,
  },
  {
    name: 'CB South Printer',
    campusCode: 'VITAP-CB-SOUTH',
    location: 'Around Central Block (CB), south side',
    description: 'Demo printer point approximately 100 meters south of Central Block.',
    latitude: 16.493628,
    longitude: 80.499389,
  },
  {
    name: 'CB West Printer',
    campusCode: 'VITAP-CB-WEST',
    location: 'Around Central Block (CB), west side',
    description: 'Demo printer point approximately 100 meters west of Central Block.',
    latitude: 16.494528,
    longitude: 80.498451,
  },
].map((printer) => ({
  ...printer,
  status: 'ONLINE',
  paperLevelPercent: 95,
  tonerLevelPercent: 90,
  queueDepth: 0,
  ppmSpeed: 35,
  activeQueueCapacity: 25,
  operatorName: 'Campus Fleet Bot',
}));

const publicTables = [
  'User',
  'StudentProfile',
  'Document',
  'PrintSetting',
  'Kiosk',
  'PickupSlot',
  'PrintOrder',
  'Payment',
  'Notification',
  'VerificationRecord',
  'SupportTicket',
  'AdminAuditLog',
];

try {
  // Keep the public schema inaccessible through the Supabase Data API by default.
  // The backend connects as the database owner and continues to serve the locator API.
  for (const table of publicTables) {
    await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY`);
  }

  for (const printer of cbPrinters) {
    await prisma.kiosk.upsert({
      where: { campusCode: printer.campusCode },
      create: printer,
      update: printer,
    });
  }

  console.log(`Upserted ${cbPrinters.length} printer locations around Central Block.`);
} finally {
  await prisma.$disconnect();
}
