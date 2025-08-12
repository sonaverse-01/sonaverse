import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Page Document (pages 컬렉션)
 * - 정적 페이지(홈, 개인정보처리방침 등) 콘텐츠 관리
 * - 다국어 지원, 섹션별 구조
 */
export interface IPageSection {
  section_key: string;
  type: string;
  content: Record<string, any>; // 언어별 콘텐츠
}

export interface IPage extends Document {
  page_key: string;
  sections: IPageSection[];
  last_updated: Date;
  updated_by: Types.ObjectId;
  is_active: boolean;
}

const PageSectionSchema = new Schema<IPageSection>({
  section_key: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
});

const PageSchema = new Schema<IPage>({
  page_key: { type: String, required: true, unique: true },
  sections: { type: [PageSectionSchema], default: [] },
  last_updated: { type: Date, default: Date.now },
  updated_by: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  is_active: { type: Boolean, default: true },
});

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema); 