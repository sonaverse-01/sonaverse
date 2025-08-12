const mongoose = require('mongoose');

// SonaverseStory 모델 직접 정의
const SonaverseStoryImageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  alignment: { type: String, enum: ['left', 'center', 'right', 'full'], default: 'center' },
  displaysize: { type: Number, default: 50 },
  originalWidth: { type: Number, required: true },
  originalHeight: { type: Number, required: true },
  uploadAt: { type: Date, default: Date.now }
}, { _id: false });

const SonaverseStoryContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  body: { type: String, required: true },
  thumbnail_url: { type: String },
  images: [SonaverseStoryImageSchema]
}, { _id: false });

const SonaverseStorySchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  youtube_url: { 
    type: String,
    validate: {
      validator: function(v) {
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
  content: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 인덱스 설정
SonaverseStorySchema.index({ is_published: 1, created_at: -1 });
SonaverseStorySchema.index({ tags: 1 });

// 저장 전 middleware
SonaverseStorySchema.pre('save', function(next) {
  this.updated_at = new Date();
  this.last_updated = new Date();
  next();
});

const SonaverseStory = mongoose.models.SonaverseStory || mongoose.model('SonaverseStory', SonaverseStorySchema);

// .env.local 파일 로드
require('dotenv').config({ path: '.env.local' });

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sonaverse');
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 더미 데이터
const dummyData = [
  {
    slug: 'sonaverse-first-story',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['소나버스', '첫번째 이야기', '시작'],
    is_published: true,
    is_main: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '소나버스의 첫 번째 이야기',
        subtitle: '새로운 시작을 위한 여정',
        body: `<h2>소나버스의 탄생 배경</h2>
        <p>소나버스는 혁신적인 기술과 창의적인 아이디어를 통해 더 나은 세상을 만들고자 하는 비전으로 시작되었습니다.</p>
        <h3>우리의 목표</h3>
        <ul>
          <li>고객 중심의 서비스 제공</li>
          <li>지속 가능한 혁신</li>
          <li>사회적 가치 창출</li>
        </ul>
        <p>앞으로도 소나버스는 끊임없는 도전과 혁신을 통해 고객들에게 최고의 가치를 제공하겠습니다.</p>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
            alt: '팀워크 이미지',
            alignment: 'center',
            displaysize: 80,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'The First Story of Sonaverse',
        subtitle: 'A Journey for a New Beginning',
        body: `<h2>Background of Sonaverse Birth</h2>
        <p>Sonaverse was founded with the vision of creating a better world through innovative technology and creative ideas.</p>
        <h3>Our Goals</h3>
        <ul>
          <li>Providing customer-centered services</li>
          <li>Sustainable innovation</li>
          <li>Creating social value</li>
        </ul>
        <p>Sonaverse will continue to provide the best value to customers through constant challenges and innovations.</p>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
            alt: 'Teamwork image',
            alignment: 'center',
            displaysize: 80,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'innovation-technology-journey',
    youtube_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    tags: ['기술', '혁신', '미래'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '혁신 기술의 여정',
        subtitle: '미래를 향한 기술 발전',
        body: `<h2>기술 혁신의 중요성</h2>
        <p>현대 사회에서 기술 혁신은 더 이상 선택이 아닌 필수입니다. 소나버스는 이러한 변화의 물결을 선도하고 있습니다.</p>
        <blockquote>
          <p>"혁신은 리더와 추종자를 구분하는 것이다." - 스티브 잡스</p>
        </blockquote>
        <h3>우리의 기술 철학</h3>
        <p>우리는 사용자 경험을 최우선으로 하는 기술 개발을 추구합니다.</p>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
            alt: '기술 혁신 이미지',
            alignment: 'full',
            displaysize: 100,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
            alt: '미래 기술',
            alignment: 'right',
            displaysize: 60,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Journey of Innovation Technology',
        subtitle: 'Technological Progress Towards the Future',
        body: `<h2>The Importance of Technological Innovation</h2>
        <p>In modern society, technological innovation is no longer a choice but a necessity. Sonaverse is leading this wave of change.</p>
        <blockquote>
          <p>"Innovation distinguishes between a leader and a follower." - Steve Jobs</p>
        </blockquote>
        <h3>Our Technology Philosophy</h3>
        <p>We pursue technology development that prioritizes user experience above all else.</p>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
            alt: 'Technology innovation image',
            alignment: 'full',
            displaysize: 100,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
            alt: 'Future technology',
            alignment: 'right',
            displaysize: 60,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'sustainable-future-vision',
    tags: ['지속가능성', '환경', '미래'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '지속 가능한 미래 비전',
        subtitle: '환경을 생각하는 기업',
        body: `<h2>환경 친화적 접근</h2>
        <p>소나버스는 지속 가능한 발전을 위해 환경 친화적인 솔루션을 개발하고 있습니다.</p>
        <h3>ESG 경영</h3>
        <p>환경(Environment), 사회(Social), 지배구조(Governance)를 모두 고려한 경영을 실천합니다.</p>
        <h4>주요 활동</h4>
        <ol>
          <li>탄소 중립 실현을 위한 기술 개발</li>
          <li>재활용 가능한 제품 설계</li>
          <li>친환경 에너지 사용 확대</li>
        </ol>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&h=500&fit=crop',
            alt: '지속가능한 환경',
            alignment: 'center',
            displaysize: 90,
            originalWidth: 800,
            originalHeight: 500,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Sustainable Future Vision',
        subtitle: 'An Environmentally Conscious Company',
        body: `<h2>Eco-Friendly Approach</h2>
        <p>Sonaverse is developing environmentally friendly solutions for sustainable development.</p>
        <h3>ESG Management</h3>
        <p>We practice management that considers Environment, Social, and Governance aspects.</p>
        <h4>Key Activities</h4>
        <ol>
          <li>Technology development for carbon neutrality</li>
          <li>Recyclable product design</li>
          <li>Expansion of eco-friendly energy use</li>
        </ol>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&h=500&fit=crop',
            alt: 'Sustainable environment',
            alignment: 'center',
            displaysize: 90,
            originalWidth: 800,
            originalHeight: 500,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'customer-success-stories',
    youtube_url: 'https://youtu.be/ScMzIvxBSi4',
    tags: ['고객', '성공사례', '만족'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '고객 성공 스토리',
        subtitle: '함께 만들어가는 성공',
        body: `<h2>고객과 함께한 여정</h2>
        <p>소나버스의 진정한 성공은 고객의 성공에서 나옵니다. 다양한 분야의 고객들과 함께한 성공 사례를 소개합니다.</p>
        <h3>파트너십의 가치</h3>
        <p>단순한 공급업체가 아닌, 진정한 파트너로서 고객의 비즈니스 성장을 함께 도모합니다.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>💡 성공의 핵심</h4>
          <p>지속적인 소통과 맞춤형 솔루션 제공</p>
        </div>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
            alt: '성공적인 팀워크',
            alignment: 'left',
            displaysize: 70,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
            alt: '비즈니스 성장',
            alignment: 'right',
            displaysize: 50,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Customer Success Stories',
        subtitle: 'Building Success Together',
        body: `<h2>Journey with Our Customers</h2>
        <p>Sonaverse's true success comes from our customers' success. We introduce success stories with customers from various fields.</p>
        <h3>The Value of Partnership</h3>
        <p>We are not just a supplier, but a true partner working together for our customers' business growth.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>💡 Key to Success</h4>
          <p>Continuous communication and customized solution provision</p>
        </div>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
            alt: 'Successful teamwork',
            alignment: 'left',
            displaysize: 70,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
            alt: 'Business growth',
            alignment: 'right',
            displaysize: 50,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'global-expansion-plan',
    tags: ['글로벌', '확장', '성장'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '글로벌 확장 계획',
        subtitle: '세계로 향하는 소나버스',
        body: `<h2>글로벌 시장 진출</h2>
        <p>소나버스는 국내 시장을 넘어 글로벌 시장으로의 확장을 추진하고 있습니다.</p>
        <h3>단계별 확장 전략</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>단계</th>
            <th>지역</th>
            <th>목표</th>
          </tr>
          <tr>
            <td>1단계</td>
            <td>동남아시아</td>
            <td>시장 진입</td>
          </tr>
          <tr>
            <td>2단계</td>
            <td>북미</td>
            <td>기술 파트너십</td>
          </tr>
          <tr>
            <td>3단계</td>
            <td>유럽</td>
            <td>브랜드 확립</td>
          </tr>
        </table>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
            alt: '글로벌 네트워크',
            alignment: 'center',
            displaysize: 100,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Global Expansion Plan',
        subtitle: 'Sonaverse Going Global',
        body: `<h2>Global Market Entry</h2>
        <p>Sonaverse is pursuing expansion into global markets beyond the domestic market.</p>
        <h3>Step-by-Step Expansion Strategy</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>Stage</th>
            <th>Region</th>
            <th>Goal</th>
          </tr>
          <tr>
            <td>Stage 1</td>
            <td>Southeast Asia</td>
            <td>Market Entry</td>
          </tr>
          <tr>
            <td>Stage 2</td>
            <td>North America</td>
            <td>Technology Partnership</td>
          </tr>
          <tr>
            <td>Stage 3</td>
            <td>Europe</td>
            <td>Brand Establishment</td>
          </tr>
        </table>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
            alt: 'Global network',
            alignment: 'center',
            displaysize: 100,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'team-culture-values',
    youtube_url: 'https://www.youtube.com/embed/ZZ5LpwO-An4',
    tags: ['문화', '팀', '가치관'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '팀 문화와 가치관',
        subtitle: '소나버스만의 특별한 문화',
        body: `<h2>우리의 핵심 가치</h2>
        <p>소나버스는 독특하고 창의적인 기업 문화를 바탕으로 성장해왔습니다.</p>
        <h3>5가지 핵심 가치</h3>
        <div style="display: grid; gap: 15px;">
          <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <strong>🎯 목표 지향</strong><br>
            명확한 목표 설정과 달성을 위한 노력
          </div>
          <div style="padding: 15px; background: #f3e5f5; border-radius: 8px;">
            <strong>🤝 협업</strong><br>
            팀워크를 통한 시너지 창출
          </div>
          <div style="padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <strong>💡 혁신</strong><br>
            끊임없는 도전과 새로운 아이디어
          </div>
          <div style="padding: 15px; background: #fff3e0; border-radius: 8px;">
            <strong>🌟 성장</strong><br>
            개인과 조직의 지속적 발전
          </div>
          <div style="padding: 15px; background: #fce4ec; border-radius: 8px;">
            <strong>❤️ 배려</strong><br>
            서로를 존중하고 배려하는 마음
          </div>
        </div>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
            alt: '팀 문화',
            alignment: 'full',
            displaysize: 95,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
            alt: '협업하는 팀',
            alignment: 'center',
            displaysize: 75,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Team Culture and Values',
        subtitle: 'Sonaverse\'s Special Culture',
        body: `<h2>Our Core Values</h2>
        <p>Sonaverse has grown based on a unique and creative corporate culture.</p>
        <h3>5 Core Values</h3>
        <div style="display: grid; gap: 15px;">
          <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <strong>🎯 Goal-Oriented</strong><br>
            Clear goal setting and efforts to achieve them
          </div>
          <div style="padding: 15px; background: #f3e5f5; border-radius: 8px;">
            <strong>🤝 Collaboration</strong><br>
            Creating synergy through teamwork
          </div>
          <div style="padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <strong>💡 Innovation</strong><br>
            Continuous challenges and new ideas
          </div>
          <div style="padding: 15px; background: #fff3e0; border-radius: 8px;">
            <strong>🌟 Growth</strong><br>
            Continuous development of individuals and organization
          </div>
          <div style="padding: 15px; background: #fce4ec; border-radius: 8px;">
            <strong>❤️ Care</strong><br>
            Respecting and caring for each other
          </div>
        </div>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
            alt: 'Team culture',
            alignment: 'full',
            displaysize: 95,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          },
          {
            src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
            alt: 'Collaborating team',
            alignment: 'center',
            displaysize: 75,
            originalWidth: 600,
            originalHeight: 400,
            uploadAt: new Date()
          }
        ]
      }
    }
  },
  {
    slug: 'research-development-insights',
    tags: ['연구개발', 'R&D', '인사이트'],
    is_published: true,
    updated_by: 'admin',
    content: {
      ko: {
        title: '연구개발 인사이트',
        subtitle: '미래를 준비하는 R&D',
        body: `<h2>혁신적인 연구개발</h2>
        <p>소나버스의 R&D 팀은 미래 기술 트렌드를 선도하며 혁신적인 솔루션을 개발하고 있습니다.</p>
        <h3>주요 연구 분야</h3>
        <ul>
          <li><strong>AI & Machine Learning</strong> - 인공지능 기반 솔루션</li>
          <li><strong>IoT & Smart Systems</strong> - 스마트 연결 기술</li>
          <li><strong>Blockchain</strong> - 분산 원장 기술</li>
          <li><strong>Sustainable Technology</strong> - 친환경 기술</li>
        </ul>
        <blockquote style="border-left: 4px solid #2196F3; padding-left: 16px; margin: 20px 0; font-style: italic;">
          "연구개발은 오늘의 투자가 내일의 성공을 만드는 것입니다."
        </blockquote>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234a?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
            alt: 'R&D 연구실',
            alignment: 'center',
            displaysize: 85,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      },
      en: {
        title: 'Research & Development Insights',
        subtitle: 'R&D Preparing for the Future',
        body: `<h2>Innovative Research & Development</h2>
        <p>Sonaverse's R&D team is leading future technology trends and developing innovative solutions.</p>
        <h3>Major Research Areas</h3>
        <ul>
          <li><strong>AI & Machine Learning</strong> - AI-based solutions</li>
          <li><strong>IoT & Smart Systems</strong> - Smart connection technology</li>
          <li><strong>Blockchain</strong> - Distributed ledger technology</li>
          <li><strong>Sustainable Technology</strong> - Eco-friendly technology</li>
        </ul>
        <blockquote style="border-left: 4px solid #2196F3; padding-left: 16px; margin: 20px 0; font-style: italic;">
          "Research and development is about today's investment creating tomorrow's success."
        </blockquote>`,
        thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234a?w=800&h=600&fit=crop',
        images: [
          {
            src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
            alt: 'R&D laboratory',
            alignment: 'center',
            displaysize: 85,
            originalWidth: 800,
            originalHeight: 600,
            uploadAt: new Date()
          }
        ]
      }
    }
  }
];

// 더미 데이터 삽입 함수
const insertDummyData = async () => {
  try {
    // 기존 데이터 삭제 (선택사항)
    await SonaverseStory.deleteMany({});
    console.log('기존 소나버스 스토리 데이터 삭제 완료');

    // 새 데이터 삽입
    const result = await SonaverseStory.insertMany(dummyData);
    console.log(`${result.length}개의 소나버스 스토리 더미 데이터 삽입 완료`);
    
    // 삽입된 데이터 확인
    const count = await SonaverseStory.countDocuments();
    console.log(`총 ${count}개의 소나버스 스토리가 데이터베이스에 저장되었습니다.`);
    
  } catch (error) {
    console.error('더미 데이터 삽입 중 오류 발생:', error);
  }
};

// 실행
const main = async () => {
  await connectDB();
  await insertDummyData();
  await mongoose.disconnect();
  console.log('작업 완료');
};

main().catch(console.error);