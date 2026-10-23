import mongoose from 'mongoose';

const RescueTeamSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true
    },
    leader: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'On the Way', 'Reached', 'In Progress', 'Completed'],
      default: 'Available'
    },
    currentLocation: {
      type: String,
      required: true
    },
    membersCount: {
      type: Number,
      default: 6
    },
    vehicle: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'rescueteams'
  }
);

export const RescueTeam = mongoose.model('RescueTeam', RescueTeamSchema);
export default RescueTeam;
