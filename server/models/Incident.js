import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const IncidentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Incident type is required'],
      enum: ['Fire', 'Flood', 'Accident', 'Building Collapse', 'Other']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    coordinates: {
      type: [Number],
      default: [18.5204, 73.8567] // Default Pune coordinates
    },
    peopleAffected: {
      type: Number,
      default: 1,
      min: 1
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    reportedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    reportedBy: {
      type: String,
      default: ''
    },
    reporterEmail: {
      type: String,
      default: ''
    },
    reporterPhone: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'On the Way', 'Reached', 'In Progress', 'Completed', 'Resolved'],
      default: 'Reported',
      index: true
    },
    assignedTeamId: {
      type: String,
      default: null,
      index: true
    },
    assignedTeamName: {
      type: String,
      default: null
    },
    photoUrl: {
      type: String,
      default: null
    },
    reportedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    timeline: {
      type: [TimelineEventSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'incidents'
  }
);

IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ status: 1, reportedAt: -1 });
IncidentSchema.index({ reportedById: 1, reportedAt: -1 });
IncidentSchema.index({ assignedTeamId: 1, status: 1 });

export const Incident = mongoose.model('Incident', IncidentSchema);
export default Incident;
