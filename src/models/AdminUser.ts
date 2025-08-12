import mongoose, { Schema, Document } from 'mongoose';

/**
 * AdminUser Document (admin_users 컬렉션)
 * - 관리자 계정 정보
 * - 비밀번호 해시, 이메일, 역할, 생성/로그인일, 활성화 여부
 */
export interface IAdminUser extends Document {
  username: string;
  password_hash: string;
  email: string;
  role: string;
  created_at: Date;
  last_login_at: Date;
  is_active: boolean;
}

const AdminUserSchema = new Schema<IAdminUser>({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
});

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema); 