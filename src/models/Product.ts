import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Product Document (products 컬렉션)
 * - 제품 정보(만보 보행기, 보듬 기저귀 등)
 * - 다국어 지원, 상세 정보, 이미지, 외부 링크
 */
export interface IProduct extends Document {
  product_name: Record<string, string>;
  slug: string;
  category: string;
  description: Record<string, string>;
  features: Record<string, string[]>;
  specifications: Record<string, Record<string, string>>;
  main_image_url: string;
  gallery_images: string[];
  external_link?: string;
  created_at: Date;
  last_updated: Date;
  updated_by: Types.ObjectId;
  is_active: boolean;
}

const ProductSchema = new Schema<IProduct>({
  product_name: { type: Schema.Types.Mixed, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: { type: Schema.Types.Mixed, required: true },
  features: { type: Schema.Types.Mixed, required: true },
  specifications: { type: Schema.Types.Mixed, required: true },
  main_image_url: { type: String, required: true },
  gallery_images: { type: [String], default: [] },
  external_link: { type: String },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  updated_by: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  is_active: { type: Boolean, default: true },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 