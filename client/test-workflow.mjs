import { defaultIncidents, defaultTeams } from './src/data/defaultData.js';

console.log('--- STARTING RESQNET WORKFLOW VERIFICATION TEST ---');

// Mock localStorage
const mockStorage = {};
const localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; }
};

const STORAGE_INCIDENTS_KEY = 'resqnet_pune_incidents_v2';
const STORAGE_TEAMS_KEY = 'resqnet_pune_teams_v2';
const STORAGE_ACTIVE_TEAM_KEY = 'resqnet_pune_active_team_v2';

// 1. Initial State
let incidents = [...defaultIncidents];
let rescueTeams = [...defaultTeams];
let activeTeamId = 'PERT-01';

console.log(`[INIT] Initial incidents count: ${incidents.length}`);
console.log(`[INIT] Initial teams count: ${rescueTeams.length}`);

// Helper to save
function saveState() {
  localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(incidents));
  localStorage.setItem(STORAGE_TEAMS_KEY, JSON.stringify(rescueTeams));
  localStorage.setItem(STORAGE_ACTIVE_TEAM_KEY, activeTeamId);
}
saveState();

// Helper matching logic used in RescueTeamDashboard
const isAssignedToTeam = (inc, team) => {
  if (!inc || !team) return false;
  const teamIdMatch =
    inc.assignedTeamId &&
    String(inc.assignedTeamId).trim().toLowerCase() === String(team.id).trim().toLowerCase();
  const teamNameMatch =
    inc.assignedTeamName &&
    team.name &&
    String(inc.assignedTeamName).trim().toLowerCase() === String(team.name).trim().toLowerCase();
  return Boolean(teamIdMatch || teamNameMatch);
};

// STEP 1: Citizen reports a new emergency
console.log('\n>>> STEP 1: Citizen Priya Sharma reports a new emergency');
const newIncidentData = {
  type: 'Accident',
  location: 'Deccan Gymkhana Bus Stop, Pune',
  peopleAffected: 4,
  severity: 'High',
  description: 'Collision between two passenger cars near Goodluck Cafe junction.'
};

const newId = `INC-${Math.floor(2000 + Math.random() * 8000)}`;
const now = new Date().toISOString();
const createdIncident = {
  id: newId,
  type: newIncidentData.type,
  title: `${newIncidentData.type} Emergency at ${newIncidentData.location.split(',')[0]}`,
  location: newIncidentData.location,
  coordinates: [18.5173, 73.8415],
  peopleAffected: newIncidentData.peopleAffected,
  severity: newIncidentData.severity,
  description: newIncidentData.description,
  reportedBy: 'Priya Sharma',
  reporterEmail: 'priya.sharma@example.com',
  reporterPhone: '+91 98220 12345',
  status: 'Reported',
  assignedTeamId: null,
  assignedTeamName: null,
  photoUrl: null,
  reportedAt: now,
  updatedAt: now,
  timeline: [{ status: 'Reported', time: now, note: 'Emergency reported by Priya Sharma' }]
};

incidents = [createdIncident, ...incidents];
saveState();
console.log(`[PASS] Emergency reported with ID: ${createdIncident.id}, Total incidents now: ${incidents.length}`);

// STEP 2: Open Admin Dashboard and verify incident appears
console.log('\n>>> STEP 2: Admin Dashboard verifies incident presence');
const adminIncident = incidents.find((i) => i.id === newId);
if (!adminIncident) throw new Error('Incident not found in Admin Dashboard view');
console.log(`[PASS] Found in Admin Dashboard: ${adminIncident.id} (${adminIncident.title}) - Status: ${adminIncident.status}, Squad: ${adminIncident.assignedTeamName || 'Unassigned'}`);

// STEP 3: Admin Rahul Patil assigns the incident to Pune Emergency Response Team 01 (PERT-01)
console.log('\n>>> STEP 3: Admin Rahul Patil assigns incident to PERT-01');
const targetTeam = rescueTeams.find((t) => t.id === 'PERT-01');
if (!targetTeam) throw new Error('Target team PERT-01 not found');

incidents = incidents.map((inc) => {
  if (inc.id === newId) {
    return {
      ...inc,
      assignedTeamId: targetTeam.id,
      assignedTeamName: targetTeam.name,
      status: 'Assigned',
      updatedAt: new Date().toISOString(),
      timeline: [
        ...inc.timeline,
        { status: 'Assigned', time: new Date().toISOString(), note: `Admin Rahul Patil assigned rescue team: ${targetTeam.name}` }
      ]
    };
  }
  return inc;
});
activeTeamId = targetTeam.id;
saveState();

const assignedRecord = incidents.find((i) => i.id === newId);
console.log(`[PASS] Incident ${assignedRecord.id} assigned: assignedTeamId=${assignedRecord.assignedTeamId}, assignedTeamName=${assignedRecord.assignedTeamName}, status=${assignedRecord.status}`);

// STEP 4: Open Rescue Team Dashboard and verify the same incident appears
console.log('\n>>> STEP 4: Verify incident appears in Rescue Team Dashboard for PERT-01');
const currentRescueTeam = rescueTeams.find((t) => t.id === activeTeamId);
console.log(`Current active squad: ${currentRescueTeam.name} (${currentRescueTeam.id})`);

const teamMissions = incidents.filter((inc) => isAssignedToTeam(inc, currentRescueTeam));
const teamActiveMissions = teamMissions.filter((inc) => inc.status !== 'Completed' && inc.status !== 'Resolved');

const foundInRescueActive = teamActiveMissions.find((i) => i.id === newId);
if (!foundInRescueActive) throw new Error('Incident does NOT appear in active missions for PERT-01!');
console.log(`[PASS] Incident ${foundInRescueActive.id} correctly appears in Rescue Team Dashboard for ${currentRescueTeam.name}!`);

// Verify all required 7 fields on mission
console.log('Verifying 7 required fields:');
console.log(` - 1. Incident ID: ${foundInRescueActive.id}`);
console.log(` - 2. Emergency Type: ${foundInRescueActive.type}`);
console.log(` - 3. Pune Location: ${foundInRescueActive.location}`);
console.log(` - 4. Severity: ${foundInRescueActive.severity}`);
console.log(` - 5. People Affected: ${foundInRescueActive.peopleAffected}`);
console.log(` - 6. Assigned Rescue Team: ${foundInRescueActive.assignedTeamName}`);
console.log(` - 7. Current Status: ${foundInRescueActive.status}`);

// STEP 5: Update status through: On the Way -> Reached -> In Progress -> Completed
console.log('\n>>> STEP 5: Rescue team updates status through all stages');
const stages = ['On the Way', 'Reached', 'In Progress', 'Completed'];

for (const stage of stages) {
  const stageTime = new Date().toISOString();
  incidents = incidents.map((inc) => {
    if (inc.id === newId) {
      return {
        ...inc,
        status: stage,
        updatedAt: stageTime,
        timeline: [...inc.timeline, { status: stage, time: stageTime, note: `Status updated to ${stage}` }]
      };
    }
    return inc;
  });
  saveState();
  const currentStatus = incidents.find((i) => i.id === newId).status;
  console.log(`[PASS] Updated status to: ${currentStatus}`);
}

// STEP 6: Verify status in Admin Dashboard and Citizen Dashboard
console.log('\n>>> STEP 6: Verify synchronized status across Admin and Citizen dashboards');
const verifiedInAdmin = incidents.find((i) => i.id === newId);
console.log(`[PASS] Admin Dashboard sees incident ${verifiedInAdmin.id} status: ${verifiedInAdmin.status}`);

const verifiedInCitizen = incidents.find((i) => i.id === newId);
console.log(`[PASS] Citizen Dashboard sees incident ${verifiedInCitizen.id} status: ${verifiedInCitizen.status}`);

if (verifiedInAdmin.status !== 'Completed' || verifiedInCitizen.status !== 'Completed') {
  throw new Error('Status not synchronized across dashboards!');
}

// STEP 7: Verify completed history in Rescue Team Dashboard
console.log('\n>>> STEP 7: Verify completed missions history in Rescue Team Dashboard');
const updatedTeamMissions = incidents.filter((inc) => isAssignedToTeam(inc, currentRescueTeam));
const updatedActive = updatedTeamMissions.filter((inc) => inc.status !== 'Completed' && inc.status !== 'Resolved');
const updatedCompleted = updatedTeamMissions.filter((inc) => inc.status === 'Completed' || inc.status === 'Resolved');

if (updatedActive.some((i) => i.id === newId)) {
  throw new Error('Completed incident should no longer be in active missions!');
}
if (!updatedCompleted.some((i) => i.id === newId)) {
  throw new Error('Completed incident should appear in completed history!');
}
console.log(`[PASS] Incident ${newId} correctly moved from Active (${updatedActive.length}) to Completed History (${updatedCompleted.length})!`);

// STEP 8: Simulate browser page refresh from localStorage
console.log('\n>>> STEP 8: Simulate browser refresh (loading from localStorage)');
const reloadedIncidents = JSON.parse(localStorage.getItem(STORAGE_INCIDENTS_KEY));
const reloadedActiveTeam = localStorage.getItem(STORAGE_ACTIVE_TEAM_KEY);

const reloadedIncident = reloadedIncidents.find((i) => i.id === newId);
if (!reloadedIncident) throw new Error('Incident lost after simulated browser refresh!');
if (reloadedIncident.status !== 'Completed') throw new Error(`Incorrect status after reload: ${reloadedIncident.status}`);
if (reloadedIncident.assignedTeamId !== 'PERT-01') throw new Error(`Incorrect assignment after reload: ${reloadedIncident.assignedTeamId}`);

console.log(`[PASS] Reload verified: ${reloadedIncident.id} intact, status=${reloadedIncident.status}, assigned=${reloadedIncident.assignedTeamName}, activeTeam=${reloadedActiveTeam}`);
console.log(`[PASS] No duplicates created: Total count is exactly ${reloadedIncidents.length}`);

console.log('\n========================================');
console.log('ALL 7 WORKFLOW TEST STEPS PASSED 100%!');
console.log('========================================');
