import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  description: { type: String },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  lastProcessedMonth: { type: String }, // Format: YYYY-MM to track auto-generation
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
