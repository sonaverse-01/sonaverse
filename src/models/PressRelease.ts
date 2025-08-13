import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * PressRelease Document (press_releases 컬렉션)
 * - 언론 보도 자료
 * - 다국어 지원, 언론사명, 본문(HTML), 외부 기사 링크, 업데이트 정보, 활성화 여부
 */
export interface IPressReleaseContent {
  title: string;
  body: string;
  external_link?: string;
}

export interface IPressRelease extends Document {
  slug: string;
  press_name: Record<string, string>;
  thumbnail?: string;
  external_link?: string;
  content: Record<string, IPressReleaseContent>;
  tags?: Record<string, string[]>;
  created_at: Date;
  last_updated: Date;
  updated_by: Types.ObjectId;
  is_active: boolean;
}

const PressReleaseContentSchema = new Schema<IPressReleaseContent>({
  title: { type: String, required: true },
  body: { type: String, required: true },
  external_link: { type: String },
});

const PressReleaseSchema = new Schema<IPressRelease>({
  slug: { type: String, required: true, unique: true },
  press_name: { type: Schema.Types.Mixed, required: true },
  thumbnail: { type: String },
  external_link: { type: String },
  content: { type: Schema.Types.Mixed, required: true },
  tags: { type: Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  updated_by: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  is_active: { type: Boolean, default: true },
});

export default mongoose.models.PressRelease || mongoose.model<IPressRelease>('PressRelease', PressReleaseSchema, 'press'); 