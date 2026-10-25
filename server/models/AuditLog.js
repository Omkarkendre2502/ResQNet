import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      required: true,
      enum: ['User', 'Incident', 'RescueTeam', 'System']
    },
    targetId: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });

export const logAudit = async ({
  user,
  action,
  targetType,
  targetId,
  details = {},
  req = null
}) => {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || '' : '';
    await AuditLog.create({
      userId: user?._id || user?.id || 'system',
      userName: user?.name || 'System',
      userRole: user?.role || 'system',
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
