export const staffMembers = [
  { id: 'EMP001', name: 'John Doe', department: 'Kitchen', branch: 'Main Branch', shift: 'Morning (08:00 - 17:00)' },
  { id: 'EMP002', name: 'Jane Smith', department: 'Service', branch: 'Mall Outlet', shift: 'Evening (15:00 - 23:30)' },
  { id: 'EMP003', name: 'Ali Hassan', department: 'Kitchen', branch: 'Main Branch', shift: 'Morning (08:00 - 17:00)' },
  { id: 'EMP004', name: 'Sarah Ahmed', department: 'Management', branch: 'Main Branch', shift: 'General (09:00 - 18:00)' },
  { id: 'EMP005', name: 'Mohammed Khan', department: 'Logistics', branch: 'Warehouse', shift: 'Night (22:00 - 06:00)' },
  { id: 'EMP006', name: 'Emily Chen', department: 'Service', branch: 'Mall Outlet', shift: 'Evening (15:00 - 23:30)' },
  { id: 'EMP007', name: 'David Lee', department: 'Kitchen', branch: 'Downtown Branch', shift: 'Morning (08:00 - 17:00)' },
  { id: 'EMP008', name: 'Fatima Ali', department: 'Management', branch: 'Downtown Branch', shift: 'General (09:00 - 18:00)' },
];

export const dailyAttendanceMock = [
  { id: 1, employee: staffMembers[0], status: 'Present', checkIn: '07:55 AM', checkOut: '05:10 PM', lateMinutes: 0 },
  { id: 2, employee: staffMembers[1], status: 'Absent', checkIn: '--', checkOut: '--', lateMinutes: 0 },
  { id: 3, employee: staffMembers[2], status: 'Present', checkIn: '08:15 AM', checkOut: '05:00 PM', lateMinutes: 15 },
  { id: 4, employee: staffMembers[3], status: 'Present', checkIn: '08:50 AM', checkOut: '--', lateMinutes: 0 },
  { id: 5, employee: staffMembers[4], status: 'On Leave', checkIn: '--', checkOut: '--', lateMinutes: 0 },
  { id: 6, employee: staffMembers[5], status: 'Half-Day', checkIn: '03:00 PM', checkOut: '07:00 PM', lateMinutes: 0 },
  { id: 7, employee: staffMembers[6], status: 'Present', checkIn: '07:45 AM', checkOut: '05:15 PM', lateMinutes: 0 },
  { id: 8, employee: staffMembers[7], status: 'Present', checkIn: '09:05 AM', checkOut: '--', lateMinutes: 5 },
];

export const recentPunchesMock = [
  { id: 101, employeeName: 'Fatima Ali', type: 'Check-In', time: '09:05 AM', date: '2026-08-29', location: 'Downtown Branch', note: 'Traffic delay' },
  { id: 102, employeeName: 'Sarah Ahmed', type: 'Check-In', time: '08:50 AM', date: '2026-08-29', location: 'Main Branch', note: '' },
  { id: 103, employeeName: 'Ali Hassan', type: 'Check-In', time: '08:15 AM', date: '2026-08-29', location: 'Main Branch', note: '' },
  { id: 104, employeeName: 'John Doe', type: 'Check-In', time: '07:55 AM', date: '2026-08-29', location: 'Main Branch', note: '' },
  { id: 105, employeeName: 'David Lee', type: 'Check-In', time: '07:45 AM', date: '2026-08-29', location: 'Downtown Branch', note: '' },
  { id: 106, employeeName: 'Mohammed Khan', type: 'Check-Out', time: '06:10 AM', date: '2026-08-29', location: 'Warehouse', note: 'Finished night shift' },
];

export const overtimeMock = [
  { id: 201, employee: staffMembers[0], date: '2026-08-28', regularHours: 9, otHours: 2.5, reason: 'Catering preparation', status: 'Pending' },
  { id: 202, employee: staffMembers[1], date: '2026-08-25', regularHours: 8.5, otHours: 4, reason: 'Weekend rush coverage', status: 'Approved' },
  { id: 203, employee: staffMembers[4], date: '2026-08-27', regularHours: 8, otHours: 1.5, reason: 'Late delivery arrival', status: 'Approved' },
  { id: 204, employee: staffMembers[6], date: '2026-08-28', regularHours: 9, otHours: 3, reason: 'Kitchen deep cleaning', status: 'Rejected' },
  { id: 205, employee: staffMembers[2], date: '2026-08-29', regularHours: 9, otHours: 2, reason: 'Covering for sick colleague', status: 'Pending' },
];

export const reportStatsMock = {
  averageAttendanceRate: 92.5,
  totalAbsencesThisMonth: 14,
  totalLateArrivals: 28,
  totalOvertimeHours: 145.5
};

export const reportTableMock = staffMembers.map(emp => ({
  id: emp.id,
  employeeName: emp.name,
  department: emp.department,
  daysPresent: Math.floor(Math.random() * 5) + 18, // 18-22 days
  daysAbsent: Math.floor(Math.random() * 3), // 0-2 days
  lateArrivals: Math.floor(Math.random() * 4), // 0-3 times
  otHours: (Math.random() * 15).toFixed(1) // 0-15 hours
}));
