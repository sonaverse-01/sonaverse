import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * AdminSetting Document (admin_settings 컬렉션)
 * - 사이트 전역 설정(회사 정보, 고객센터, SNS, 푸터, 문의 카테고리 등)
 * - 단일 문서로 관리
 */
export interface IAdminSetting extends Document {
  _id: string;
  company_info: Record<string, any>;
  customer_service: Record<string, any>;
  sns_links: Array<{ name: string; url: string; icon: string }>;
  footer_logo_url: string;
  privacy_policy_url: string;
  inquiry_categories: Array<{ key: string; name: Record<string, string> }>;
  last_updated: Date;
  updated_by: Types.ObjectId;
}

const AdminSettingSchema = new Schema<IAdminSetting>({
  _id: { type: String, required: true },
  company_info: { type: Schema.Types.Mixed, required: true },
  customer_service: { type: Schema.Types.Mixed, required: true },
  sns_links: { type: [Object], default: [] },
  footer_logo_url: { type: String, required: true },
  privacy_policy_url: { type: String, required: true },
  inquiry_categories: { type: [Object], default: [] },
  last_updated: { type: Date, default: Date.now },
  updated_by: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
});

export default mongoose.models.AdminSetting || mongoose.model<IAdminSetting>('AdminSetting', AdminSettingSchema); 