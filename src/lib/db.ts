import mongoose from 'mongoose';

/**
 * MongoDB(Mongoose) 연결 유틸리티
 * - 환경 변수 MONGODB_URI를 사용
 * - Next.js 환경에서 연결 재사용(핫 리로드 시 중복 연결 방지)
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경 변수가 설정되어 있지 않습니다.');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
} 