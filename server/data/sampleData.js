export const initialTeams = [
  {
    id: "PERT-01",
    name: "Pune Emergency Response Team 01",
    type: "Fire & Rescue Squad",
    leader: "Inspector Rajesh Kadam",
    phone: "+91 (020) 2550-6789",
    status: "In Progress",
    currentLocation: "Shivajinagar",
    membersCount: 8,
    vehicle: "Fire Tender & Rescue Van #1"
  },
  {
    id: "PERT-02",
    name: "Pune Emergency Response Team 02",
    type: "Disaster & Flood Relief",
    leader: "Officer Vikram Shinde",
    phone: "+91 (020) 2444-1122",
    status: "Available",
    currentLocation: "Swargate",
    membersCount: 10,
    vehicle: "Rescue Truck & Boats"
  },
  {
    id: "PERT-03",
    name: "108 Medical Emergency Unit",
    type: "Medical & Ambulance",
    leader: "Dr. Sunita Joshi",
    phone: "+91 108 / 98221 44556",
    status: "Available",
    currentLocation: "Pune Railway Station (Sassoon Base)",
    membersCount: 4,
    vehicle: "Advanced Life Support Ambulance"
  }
];

export const initialIncidents = [
  {
    id: "INC-2001",
    type: "Fire",
    title: "Commercial Complex Electrical Fire at Shivajinagar",
    location: "Near Shivajinagar Bus Stand, Pune",
    coordinates: [18.5314, 73.8446],
    peopleAffected: 6,
    severity: "Critical",
    description: "Smoke emerging from ground-floor electrical meter room. Building partially evacuated, 2 people suspected on upper floor.",
    reportedBy: "Priya Sharma",
    reporterEmail: "priya.sharma@example.com",
    reporterPhone: "+91 98220 12345",
    status: "In Progress",
    assignedTeamId: "PERT-01",
    assignedTeamName: "Pune Emergency Response Team 01",
    photoUrl: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=600&q=80",
    reportedAt: "2026-10-22T21:45:00.000Z",
    updatedAt: "2026-10-22T22:15:00.000Z",
    timeline: [
      { status: "Reported", time: "2026-10-22T21:45:00.000Z", note: "Emergency reported by Priya Sharma" },
      { status: "Assigned", time: "2026-10-22T21:50:00.000Z", note: "Admin Rahul Patil assigned Pune Emergency Response Team 01" },
      { status: "On the Way", time: "2026-10-22T21:55:00.000Z", note: "PERT-01 dispatched from Shivajinagar Station" },
      { status: "Reached", time: "2026-10-22T22:05:00.000Z", note: "Team arrived at scene, water line connected" },
      { status: "In Progress", time: "2026-10-22T22:15:00.000Z", note: "Active fire suppression underway" }
    ]
  },
  {
    id: "INC-2002",
    type: "Flood",
    title: "Waterlogging & Vehicle Stranded at Hinjawadi Phase 1",
    location: "Wipro Circle Underpass, Hinjawadi, Pune",
    coordinates: [18.5913, 73.7389],
    peopleAffected: 3,
    severity: "High",
    description: "Heavy downpour waterlogging under the culvert. Car stalled in 2.5 ft water with passengers waiting safely on embankment.",
    reportedBy: "Amit Deshmukh",
    reporterEmail: "amit.deshmukh@example.com",
    reporterPhone: "+91 98901 23456",
    status: "Reported",
    assignedTeamId: null,
    assignedTeamName: null,
    photoUrl: null,
    reportedAt: "2026-10-22T23:10:00.000Z",
    updatedAt: "2026-10-22T23:10:00.000Z",
    timeline: [
      { status: "Reported", time: "2026-10-22T23:10:00.000Z", note: "Reported via ResQNet Citizen Portal" }
    ]
  }
];
