export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@alnaazgroup.com',
    phone: '+91 98765 43210',
    role: 'Super Admin',
    branch: 'All Branches',
    assignedBranches: ['Kochi Main', 'Calicut Center', 'Trivandrum South', 'Dubai Marina', 'Bangalore Hub'],
    status: 'Active',
    lastLogin: '10 mins ago',
    avatar: 'A',
    createdAt: '2025-01-10',
    activityLogs: [
      { id: 101, action: 'Logged in from Web Dashboard', timestamp: '10 mins ago', ip: '192.168.1.45' },
      { id: 102, action: 'Updated Permissions Matrix', timestamp: '2 hours ago', ip: '192.168.1.45' },
      { id: 103, action: 'Approved Salary Disbursal', timestamp: 'Yesterday at 4:30 PM', ip: '192.168.1.45' }
    ]
  },
  {
    id: 2,
    name: 'Rahul Kumar',
    email: 'rahul.k@alnaazgroup.com',
    phone: '+91 98470 12345',
    role: 'Branch Manager',
    branch: 'Kochi Main',
    assignedBranches: ['Kochi Main', 'Calicut Center'],
    status: 'Active',
    lastLogin: '2 hours ago',
    avatar: 'R',
    createdAt: '2025-02-01',
    activityLogs: [
      { id: 201, action: 'Logged in from Mobile POS', timestamp: '2 hours ago', ip: '110.22.45.12' },
      { id: 202, action: 'Added Stock Adjustment for Kochi Branch', timestamp: '3 hours ago', ip: '110.22.45.12' }
    ]
  },
  {
    id: 3,
    name: 'Priya Patel',
    email: 'priya.p@alnaazgroup.com',
    phone: '+91 97451 98765',
    role: 'Cashier',
    branch: 'Calicut Center',
    assignedBranches: ['Calicut Center'],
    status: 'Active',
    lastLogin: '1 day ago',
    avatar: 'P',
    createdAt: '2025-03-15',
    activityLogs: [
      { id: 301, action: 'Closed Cash Register Shift #402', timestamp: '1 day ago', ip: '122.16.89.4' }
    ]
  },
  {
    id: 4,
    name: 'John Davis',
    email: 'john.d@alnaazgroup.com',
    phone: '+91 99800 11223',
    role: 'Kitchen Staff',
    branch: 'Bangalore Hub',
    assignedBranches: ['Bangalore Hub'],
    status: 'Suspended',
    lastLogin: '2 weeks ago',
    avatar: 'J',
    createdAt: '2025-04-10',
    activityLogs: [
      { id: 401, action: 'Account Suspended by Admin', timestamp: '2 weeks ago', ip: 'System' }
    ]
  },
  {
    id: 5,
    name: 'Sayed Abbas',
    email: 'sayed.a@alnaazgroup.com',
    phone: '+971 50 123 9988',
    role: 'Branch Manager',
    branch: 'Dubai Marina',
    assignedBranches: ['Dubai Marina'],
    status: 'Pending',
    lastLogin: 'Never',
    avatar: 'S',
    createdAt: '2025-08-28',
    activityLogs: [
      { id: 501, action: 'Invitation Email Sent', timestamp: '5 days ago', ip: 'System' }
    ]
  }
];

export const mockRolesList = [
  'Super Admin',
  'Branch Manager',
  'Cashier',
  'Kitchen Staff',
  'Auditor'
];

export const mockBranchesList = [
  { id: 'koc_01', name: 'Kochi Main' },
  { id: 'cal_01', name: 'Calicut Center' },
  { id: 'tvm_01', name: 'Trivandrum South' },
  { id: 'dxb_01', name: 'Dubai Marina' },
  { id: 'blr_01', name: 'Bangalore Hub' }
];
