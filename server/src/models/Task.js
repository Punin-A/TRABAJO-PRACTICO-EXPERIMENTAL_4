import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 500 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

taskSchema.index({ owner: 1, createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);
