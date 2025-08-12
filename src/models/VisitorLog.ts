import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitorLog extends Document {
  page: string;
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorLogSchema: Schema = new Schema({
  page: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  referrer: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  ip: {
    type: String,
    required: false
  },
  sessionId: {
    type: String,
    required: false,
    index: true
  }
}, {
  timestamps: true
});

// 복합 인덱스 생성
VisitorLogSchema.index({ timestamp: 1, page: 1 });
VisitorLogSchema.index({ createdAt: 1 });

export default mongoose.models.VisitorLog || mongoose.model<IVisitorLog>('VisitorLog', VisitorLogSchema); 