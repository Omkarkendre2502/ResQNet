import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (v) {
          if (/^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(v)) return true;
          return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
        },
        message: 'Password must be at least 8 characters long and contain at least one letter and one number.'
      }
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'rescue'],
      default: 'citizen'
    },
    phone: {
      type: String,
      default: ''
    },
    teamId: {
      type: String,
      default: null // e.g. 'PERT-01' for rescue squad users
    },
    isActive: {
      type: Boolean,
      default: true
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'users' // Reuses the existing 'users' collection in resqnet DB
  }
);

UserSchema.virtual('isLocked').get(function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.methods.incLoginAttempts = async function () {
  // If previously locked and lock expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
    return this.save();
  }

  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
  }
  return this.save();
};

UserSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// Hash password before saving if modified
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.index({ role: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ teamId: 1 });

export const User = mongoose.model('User', UserSchema);
export default User;
