import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * SonaverseStory Document (sonaverse_stories 컬렉션)
 * - 소나버스 스토리 콘텐츠 (블로그 + 브랜드 스토리 통합)
 * - 다국어 지원, YouTube 임베디드 영상, 본문(HTML), 썸네일, 작성자, 태그, 작성/수정일, 공개 여부
 */
export interface ISonaverseStoryImage {
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  displaysize: number;
  originalWidth: number;
  originalHeight: number;
  uploadAt: Date;
}

export interface ISonaverseStoryContent {
  title: string;
  subtitle?: string;
  body: string; // HTML(iframe, img 등 임베디드 미디어 포함 가능)
  thumbnail_url?: string;
  images?: ISonaverseStoryImage[];
}

export interface ISonaverseStory extends Document {
  slug: string;
  author?: Types.ObjectId;
  youtube_url?: string; // YouTube URL이 있으면 임베디드 영상을 최상단에 표시
  tags: string[];
  created_at: Date;
  last_updated: Date;
  updated_at: Date;
  updated_by: string;
  is_published: boolean;
  is_main?: boolean; // 메인 게시물 여부
  content: Record<string, ISonaverseStoryContent>;
}

const SonaverseStoryImageSchema = new Schema<ISonaverseStoryImage>({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  alignment: { type: String, enum: ['left', 'center', 'right', 'full'], default: 'center' },
  displaysize: { type: Number, default: 50 },
  originalWidth: { type: Number, required: true },
  originalHeight: { type: Number, required: true },
  uploadAt: { type: Date, default: Date.now }
}, { _id: false });

const SonaverseStoryContentSchema = new Schema<ISonaverseStoryContent>({
  title: { type: String, required: true },
  subtitle: { type: String },
  body: { type: String, required: true },
  thumbnail_url: { type: String },
  images: [SonaverseStoryImageSchema]
}, { _id: false });

const SonaverseStorySchema = new Schema<ISonaverseStory>({
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  author: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  youtube_url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // 빈 값은 허용
        // 일반 YouTube URL과 embed URL 모두 허용
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(.*)?$/;
        return youtubeRegex.test(v);
      },
      message: 'Invalid YouTube URL format'
    }
  },
  tags: [{ type: String, trim: true }],
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  updated_by: { type: String, required: true },
  is_published: { type: Boolean, default: false },
  is_main: { type: Boolean, default: false },
  content: { type: Schema.Types.Mixed, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 인덱스 설정
SonaverseStorySchema.index({ is_published: 1, created_at: -1 });
SonaverseStorySchema.index({ tags: 1 });

// 저장 전 middleware
SonaverseStorySchema.pre('save', function(this: ISonaverseStory, next) {
  this.updated_at = new Date();
  this.last_updated = new Date();
  next();
});

export default mongoose.models.SonaverseStory || mongoose.model<ISonaverseStory>('SonaverseStory', SonaverseStorySchema); 