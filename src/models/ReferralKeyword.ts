import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralKeyword extends Document {
  keyword: string;
  searchEngine: string; // 'naver', 'google', 'daum', 'bing', etc.
  referrerUrl: string;
  count: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralKeywordSchema: Schema = new Schema({
  keyword: {
    type: String,
    required: true,
    index: true
  },
  searchEngine: {
    type: String,
    required: true,
    index: true
  },
  referrerUrl: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true,
    default: 1
  },
  lastUsed: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// 복합 인덱스 생성
ReferralKeywordSchema.index({ keyword: 1, searchEngine: 1 }, { unique: true });
ReferralKeywordSchema.index({ lastUsed: -1, count: -1 });
ReferralKeywordSchema.index({ searchEngine: 1, count: -1 });

export default mongoose.models.ReferralKeyword || mongoose.model<IReferralKeyword>('ReferralKeyword', ReferralKeywordSchema);