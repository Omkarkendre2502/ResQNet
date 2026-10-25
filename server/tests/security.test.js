process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app, { closeServer } from '../server.js';
import Incident from '../models/Incident.js';
import RescueTeam from '../models/RescueTeam.js';
import User from '../models/User.js';
import { getJwtSecret } from '../config/jwt.js';

describe('ResQNet Security and Access Control Tests', () => {
  let adminToken;
  let citizenToken;
  let rescueTokenPert01;
  let rescueTokenPert02;

  let testAdminUser;
  let testCitizenUser;
  let testRescue1;
  let testRescue2;

  const testReportedId = 'TEST-INC-REPORTED-01';
  const testAssignedId = 'TEST-INC-ASSIGNED-01';
  const testSquadId = 'PERT-01';
  const otherSquadId = 'PERT-02';

  before(async () => {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('open', resolve);
      });
    }

    const secret = getJwtSecret();

    // Create real test users in MongoDB
    testAdminUser = await User.findOneAndUpdate(
      { email: 'test-admin-suite@resqnet.org' },
      {
        name: 'Test Admin',
        email: 'test-admin-suite@resqnet.org',
        password: 'Password123!',
        role: 'admin',
        phone: '+91 98230 45678'
      },
      { upsert: true, returnDocument: 'after' }
    );

    testCitizenUser = await User.findOneAndUpdate(
      { email: 'test-citizen-suite@resqnet.org' },
      {
        name: 'Test Citizen',
        email: 'test-citizen-suite@resqnet.org',
        password: 'Password123!',
        role: 'citizen',
        phone: '+91 98220 12345'
      },
      { upsert: true, returnDocument: 'after' }
    );

    testRescue1 = await User.findOneAndUpdate(
      { email: 'test-rescue1-suite@resqnet.org' },
      {
        name: 'Test Rescue PERT-01',
        email: 'test-rescue1-suite@resqnet.org',
        password: 'Password123!',
        role: 'rescue',
        teamId: testSquadId,
        phone: '+91 (020) 2550-6789'
      },
      { upsert: true, returnDocument: 'after' }
    );

    testRescue2 = await User.findOneAndUpdate(
      { email: 'test-rescue2-suite@resqnet.org' },
      {
        name: 'Test Rescue PERT-02',
        email: 'test-rescue2-suite@resqnet.org',
        password: 'Password123!',
        role: 'rescue',
        teamId: otherSquadId,
        phone: '+91 (020) 2444-1122'
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Generate valid tokens with actual MongoDB user IDs
    adminToken = jwt.sign(
      { id: testAdminUser._id, role: testAdminUser.role, name: testAdminUser.name, email: testAdminUser.email },
      secret,
      { expiresIn: '1h' }
    );

    citizenToken = jwt.sign(
      { id: testCitizenUser._id, role: testCitizenUser.role, name: testCitizenUser.name, email: testCitizenUser.email },
      secret,
      { expiresIn: '1h' }
    );

    rescueTokenPert01 = jwt.sign(
      { id: testRescue1._id, role: testRescue1.role, teamId: testRescue1.teamId, name: testRescue1.name, email: testRescue1.email },
      secret,
      { expiresIn: '1h' }
    );

    rescueTokenPert02 = jwt.sign(
      { id: testRescue2._id, role: testRescue2.role, teamId: testRescue2.teamId, name: testRescue2.name, email: testRescue2.email },
      secret,
      { expiresIn: '1h' }
    );

    // Ensure test squads exist
    await RescueTeam.findOneAndUpdate(
      { id: testSquadId },
      {
        id: testSquadId,
        name: 'Pune Emergency Response Team 01',
        type: 'Fire & Rescue Squad',
        leader: 'Test Leader 1',
        phone: '+91 (020) 2550-6789',
        status: 'Available',
        currentLocation: 'Shivajinagar'
      },
      { upsert: true, returnDocument: 'after' }
    );

    await RescueTeam.findOneAndUpdate(
      { id: otherSquadId },
      {
        id: otherSquadId,
        name: 'Pune Emergency Response Team 02',
        type: 'Disaster Relief',
        leader: 'Test Leader 2',
        phone: '+91 (020) 2444-1122',
        status: 'Available',
        currentLocation: 'Swargate'
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Create test incident in 'Reported' status
    await Incident.findOneAndUpdate(
      { id: testReportedId },
      {
        id: testReportedId,
        type: 'Fire',
        title: 'Test Incident Reported',
        location: 'Shivajinagar, Pune',
        coordinates: [18.5204, 73.8567],
        peopleAffected: 2,
        severity: 'High',
        description: 'Test fire incident in reported state',
        status: 'Reported',
        assignedTeamId: null,
        assignedTeamName: null,
        reportedBy: 'Test Reporter',
        reportedAt: new Date(),
        updatedAt: new Date(),
        timeline: [{ status: 'Reported', time: new Date(), note: 'Initial test report' }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Create test incident in 'Assigned' status for PERT-01
    await Incident.findOneAndUpdate(
      { id: testAssignedId },
      {
        id: testAssignedId,
        type: 'Flood',
        title: 'Test Incident Assigned',
        location: 'Kothrud, Pune',
        coordinates: [18.5074, 73.8077],
        peopleAffected: 3,
        severity: 'Medium',
        description: 'Test flood incident assigned to PERT-01',
        status: 'Assigned',
        assignedTeamId: testSquadId,
        assignedTeamName: 'Pune Emergency Response Team 01',
        reportedBy: 'Test Reporter 2',
        reportedAt: new Date(),
        updatedAt: new Date(),
        timeline: [
          { status: 'Reported', time: new Date(), note: 'Initial report' },
          { status: 'Assigned', time: new Date(), note: 'Assigned to PERT-01' }
        ]
      },
      { upsert: true, returnDocument: 'after' }
    );
  });

  after(async () => {
    // Clean up test documents
    await Incident.deleteMany({ id: { $in: [testReportedId, testAssignedId] } });
    await User.deleteMany({
      email: {
        $in: [
          'test-admin-suite@resqnet.org',
          'test-citizen-suite@resqnet.org',
          'test-rescue1-suite@resqnet.org',
          'test-rescue2-suite@resqnet.org'
        ]
      }
    });
    await User.deleteMany({ email: /test-registered-.*@resqnet\.org/ });
    await mongoose.disconnect();
    if (closeServer) closeServer();
  });

  // 1. Anonymous request to assign / status / team-update returns 401
  describe('1. Unauthenticated Requests (401)', () => {
    it('should return 401 when assigning an incident without a token', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testReportedId}/assign`)
        .send({ teamId: testSquadId });

      assert.equal(res.status, 401);
      assert.match(res.body.error, /token required|access denied/i);
    });

    it('should return 401 when updating incident status without a token', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testAssignedId}/status`)
        .send({ status: 'On the Way' });

      assert.equal(res.status, 401);
      assert.match(res.body.error, /token required|access denied/i);
    });

    it('should return 401 when fetching incidents without a token', async () => {
      const res = await request(app).get('/api/incidents');
      assert.equal(res.status, 401);
      assert.match(res.body.error, /token required|access denied/i);
    });

    it('should return 401 when fetching rescue teams without a token', async () => {
      const res = await request(app).get('/api/rescue-teams');
      assert.equal(res.status, 401);
      assert.match(res.body.error, /token required|access denied/i);
    });
  });

  // 2. Citizen calling assign returns 403
  describe('2. Role Authorization: Citizen Calling Admin Endpoints (403)', () => {
    it('should return 403 Forbidden when a citizen attempts to assign an incident', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${testReportedId}/assign`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ teamId: testSquadId });

      assert.equal(res.status, 403);
      assert.match(res.body.error, /forbidden|not authorized/i);
    });
  });

  // 3. Rescue user updating another squad's incident returns 403
  describe('3. Rescue Squad Cross-Team Access Control (403)', () => {
    it("should return 403 when a rescue user attempts to update another squad's incident", async () => {
      // testAssignedId is assigned to PERT-01; rescueTokenPert02 belongs to PERT-02
      const res = await request(app)
        .patch(`/api/incidents/${testAssignedId}/status`)
        .set('Authorization', `Bearer ${rescueTokenPert02}`)
        .send({ status: 'On the Way' });

      assert.equal(res.status, 403);
      assert.match(res.body.error, /assigned to their own squad|forbidden/i);
    });
  });

  // 4. Invalid severity / type / status returns 400
  describe('4. Input Validation (400)', () => {
    it('should return 400 when creating an incident with an invalid severity', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          type: 'Fire',
          location: 'Pune Station, Pune',
          severity: 'SuperCritical', // Invalid severity
          description: 'Emergency fire test'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /validation failed|severity/i);
    });

    it('should return 400 when creating an incident with an invalid type', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          type: 'Volcano', // Invalid type
          location: 'Pune Station, Pune',
          severity: 'High',
          description: 'Emergency volcano test'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /validation failed|type/i);
    });

    it('should return 400 when filtering incidents with an invalid status query parameter', async () => {
      const res = await request(app)
        .get('/api/incidents?status=InvalidStatusFilter')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 400);
      assert.match(res.body.error, /status/i);
    });
  });

  // 5. Skipping a status step (e.g. Reported -> Reached) returns 409
  describe('5. Status Flow Enforcement (409 Conflict)', () => {
    it('should return 409 Conflict when attempting to skip status steps (Reported -> Reached)', async () => {
      // testReportedId is in 'Reported' status. Next valid step is 'Assigned'.
      const res = await request(app)
        .patch(`/api/incidents/${testReportedId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Reached' }); // Skipping 'Assigned' and 'On the Way'

      assert.equal(res.status, 409);
      assert.match(res.body.error, /invalid status transition/i);
    });
  });

  // 6. Register endpoint always creates role 'citizen' even if body says role: 'admin'
  // 6. Register endpoint always creates role 'citizen' even if body says role: 'admin'
  describe("6. Registration Role Tampering Prevention (Enforces 'citizen')", () => {
    it("should ignore body role: 'admin' and create account with role: 'citizen'", async () => {
      const testEmail = `test-registered-${Date.now()}@resqnet.org`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Privilege Escalation Attacker',
          email: testEmail,
          password: 'securePassword123!',
          phone: '+91 98220 12345',
          role: 'admin' // Attempting to escalate to admin
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.user);
      assert.equal(res.body.user.role, 'citizen', 'User role must be strictly citizen');
      assert.notEqual(res.body.user.role, 'admin', 'User must NOT be created as admin');

      // Verify in MongoDB
      const savedUser = await User.findOne({ email: testEmail });
      assert.ok(savedUser);
      assert.equal(savedUser.role, 'citizen');
    });
  });

  // 7. Role-Based Data Isolation
  describe('7. Role-Based Data Isolation', () => {
    it('should isolate incident data between citizens and rescue squads', async () => {
      // Citizen fetch: should only contain citizen's own incidents
      const citizenRes = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.equal(citizenRes.status, 200);
      assert.ok(Array.isArray(citizenRes.body));
      citizenRes.body.forEach((inc) => {
        const matchesReporter =
          String(inc.reportedById) === String(testCitizenUser._id) ||
          inc.reporterEmail?.toLowerCase() === testCitizenUser.email.toLowerCase();
        assert.ok(matchesReporter, 'Citizen received an incident they did not report');
      });

      // Rescue squad fetch: should only contain squad's assigned incidents
      const rescueRes = await request(app)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${rescueTokenPert01}`);

      assert.equal(rescueRes.status, 200);
      assert.ok(Array.isArray(rescueRes.body));
      rescueRes.body.forEach((inc) => {
        assert.equal(inc.assignedTeamId, 'PERT-01', 'Rescue squad received an incident belonging to another squad');
      });
    });
  });

  // 8. Account Lockout Protection
  describe('8. Account Lockout Protection', () => {
    it('should lock an account after repeated failed login attempts', async () => {
      const lockEmail = `test-lockout-${Date.now()}@resqnet.org`;
      const lockUser = new User({
        name: 'Lockout Test',
        email: lockEmail,
        password: 'Password123!',
        role: 'citizen',
        isActive: true
      });
      await lockUser.save();

      // Trigger 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: lockEmail, password: 'WrongPassword999!' });
      }

      // 6th attempt: should return 403 Forbidden with lockout message
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: lockEmail, password: 'Password123!' });

      assert.equal(res.status, 403);
      assert.match(res.body.error, /locked/i);
    });
  });

  // 9. Change Password (Protected)
  describe('9. Password Modification Security', () => {
    it('should reject password change with incorrect current password', async () => {
      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          currentPassword: 'WrongCurrentPassword123!',
          newPassword: 'BrandNewPassword123!'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /incorrect current password/i);
    });
  });

  // 10. Admin User Management Controls
  describe('10. Admin User Management Controls', () => {
    it('should reject non-admin access to admin directory', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.equal(res.status, 403);
    });

    it('should prevent an administrator from deactivating their own account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${testAdminUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /cannot change activation status of your own account/i);
    });

    it('should allow an administrator to toggle user activation status', async () => {
      // Toggle citizen user inactive
      const res = await request(app)
        .patch(`/api/admin/users/${testCitizenUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.isActive, false);

      // Restore to active
      const restoreRes = await request(app)
        .patch(`/api/admin/users/${testCitizenUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      assert.equal(restoreRes.status, 200);
      assert.equal(restoreRes.body.user.isActive, true);
    });
  });
});
