import mongoose from 'mongoose';
import { Lead } from '@/types/Lead';

const leadSchema = new mongoose.Schema<Lead>({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'renter'],
    default: null,
  },
  source: {
    type: String,
    enum: ['new', 'old'],
    required: true,
  },
  area: {
    type: String,
    default: null,
  },
  budget: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'calling', 'answered', 'qualified', 'dropped'],
    default: 'pending',
  },
  result: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: null,
  },
  callAttempts: {
    type: Number,
    default: 0,
  },
  lastCallAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

// Index for performance
leadSchema.index({ status: 1 });
leadSchema.index({ result: 1 });
leadSchema.index({ createdAt: -1 });

export const LeadModel = mongoose.models.Lead || mongoose.model<Lead>('Lead', leadSchema);