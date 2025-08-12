const mongoose = require('mongoose');

// MongoDB 연결 - Atlas 연결 문자열
const MONGODB_URI = 'mongodb+srv://sonaverse:sonaverse123@cluster0.mongodb.net/sonaverse?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// BrandStory 스키마 정의
const BrandStorySchema = new mongoose.Schema({
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
        if (!v) return true;
        return /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/.test(v);
      },
      message: 'Invalid YouTube embed URL format'
    }
  },
  tags: [{ type: String, trim: true }],
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  updated_by: { type: String, required: true },
  is_published: { type: Boolean, default: false },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const BrandStory = mongoose.model('BrandStory', BrandStorySchema);

// 더미 데이터
const brandStories = [
  {
    slug: 'sonaverse-story-1',
    youtube_url: 'https://www.youtube.com/embed/zNEH586xSts?si=q34J5DB535a1JCmc',
    tags: ['브랜드스토리', '소나버스', '시작'],
    updated_by: 'admin',
    is_published: true,
    content: {
      ko: {
        title: '소나버스의 시작',
        subtitle: '혁신적인 육아 솔루션으로 시작된 여정',
        body: `
          <h2>소나버스의 탄생</h2>
          <p>2023년, 소나버스는 부모님들의 육아 고민을 해결하기 위해 시작되었습니다. 
          우리는 아이들의 안전과 건강을 최우선으로 생각하며, 혁신적인 제품을 개발해왔습니다.</p>
          
          <h3>우리의 미션</h3>
          <p>소나버스는 모든 아이가 안전하고 건강하게 성장할 수 있는 환경을 만들어가는 것을 목표로 합니다. 
          우리의 제품은 엄격한 품질 관리와 지속적인 연구개발을 통해 만들어집니다.</p>
          
          <h3>혁신의 시작</h3>
          <p>첫 번째 제품인 '보듬 기저귀'는 아이들의 피부 건강을 고려한 특별한 소재로 만들어졌습니다. 
          이는 단순한 기저귀가 아닌, 아이들의 편안함을 위한 과학적 솔루션입니다.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      },
      en: {
        title: 'The Beginning of Sonaverse',
        subtitle: 'A journey started with innovative parenting solutions',
        body: `
          <h2>The Birth of Sonaverse</h2>
          <p>In 2023, Sonaverse was born to solve the parenting concerns of parents. 
          We have always prioritized children's safety and health, developing innovative products.</p>
          
          <h3>Our Mission</h3>
          <p>Sonaverse aims to create an environment where all children can grow safely and healthily. 
          Our products are made through strict quality control and continuous research and development.</p>
          
          <h3>The Beginning of Innovation</h3>
          <p>Our first product, 'BO DUME Diaper', was made with special materials considering children's skin health. 
          This is not just a diaper, but a scientific solution for children's comfort.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    }
  },
  {
    slug: 'innovation-journey',
    youtube_url: 'https://www.youtube.com/embed/zNEH586xSts?si=q34J5DB535a1JCmc',
    tags: ['혁신', '연구개발', '기술'],
    updated_by: 'admin',
    is_published: true,
    content: {
      ko: {
        title: '혁신의 여정',
        subtitle: '끊임없는 연구와 개발로 만들어가는 미래',
        body: `
          <h2>연구개발의 중심</h2>
          <p>소나버스는 지속적인 연구개발을 통해 더 나은 제품을 만들어갑니다. 
          우리의 R&D 팀은 아이들의 성장 단계별 특성을 연구하여 최적의 솔루션을 제공합니다.</p>
          
          <h3>기술의 힘</h3>
          <p>최신 기술을 활용하여 아이들의 안전과 편안함을 동시에 만족시키는 제품을 개발합니다. 
          각 제품은 수많은 테스트를 거쳐 부모님들의 신뢰를 얻고 있습니다.</p>
          
          <h3>미래를 향한 도전</h3>
          <p>우리는 미래의 육아 환경을 선도하는 기업이 되기 위해 끊임없이 도전합니다. 
          새로운 아이디어와 기술을 통해 더 나은 세상을 만들어갑니다.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop'
      },
      en: {
        title: 'Journey of Innovation',
        subtitle: 'Creating the future through continuous research and development',
        body: `
          <h2>Center of Research and Development</h2>
          <p>Sonaverse creates better products through continuous research and development. 
          Our R&D team researches the characteristics of each stage of children's growth to provide optimal solutions.</p>
          
          <h3>The Power of Technology</h3>
          <p>We develop products that satisfy both children's safety and comfort using the latest technology. 
          Each product goes through numerous tests to gain parents' trust.</p>
          
          <h3>Challenge Towards the Future</h3>
          <p>We continuously challenge ourselves to become a company that leads the future parenting environment. 
          We create a better world through new ideas and technology.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop'
      }
    }
  },
  {
    slug: 'quality-commitment',
    youtube_url: 'https://www.youtube.com/embed/zNEH586xSts?si=q34J5DB535a1JCmc',
    tags: ['품질', '안전', '신뢰'],
    updated_by: 'admin',
    is_published: true,
    content: {
      ko: {
        title: '품질에 대한 약속',
        subtitle: '아이들의 안전을 위한 엄격한 품질 관리',
        body: `
          <h2>품질 관리 시스템</h2>
          <p>소나버스의 모든 제품은 엄격한 품질 관리 시스템을 거쳐 제작됩니다. 
          원료부터 최종 제품까지 모든 과정에서 안전성을 최우선으로 합니다.</p>
          
          <h3>안전 기준</h3>
          <p>국제 안전 기준을 충족하는 것은 물론, 더욱 엄격한 자체 기준을 적용합니다. 
          아이들의 피부에 직접 닿는 제품이므로 특별한 주의를 기울입니다.</p>
          
          <h3>신뢰의 기반</h3>
          <p>부모님들의 신뢰는 우리의 가장 큰 자산입니다. 
          그 신뢰를 지키기 위해 끊임없이 노력하며, 투명한 정보 제공을 통해 소통합니다.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      },
      en: {
        title: 'Commitment to Quality',
        subtitle: 'Strict quality control for children\'s safety',
        body: `
          <h2>Quality Management System</h2>
          <p>All Sonaverse products are manufactured through a strict quality management system. 
          We prioritize safety in every process from raw materials to final products.</p>
          
          <h3>Safety Standards</h3>
          <p>We not only meet international safety standards but also apply even stricter internal standards. 
          We pay special attention as our products come into direct contact with children's skin.</p>
          
          <h3>Foundation of Trust</h3>
          <p>Parents' trust is our greatest asset. 
          We continuously strive to maintain that trust and communicate through transparent information provision.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    }
  },
  {
    slug: 'global-vision',
    youtube_url: 'https://www.youtube.com/embed/zNEH586xSts?si=q34J5DB535a1JCmc',
    tags: ['글로벌', '비전', '미래'],
    updated_by: 'admin',
    is_published: true,
    content: {
      ko: {
        title: '글로벌 비전',
        subtitle: '전 세계 아이들을 위한 혁신적인 솔루션',
        body: `
          <h2>세계로의 확장</h2>
          <p>소나버스는 한국을 넘어 전 세계의 아이들과 부모님들에게 혁신적인 솔루션을 제공합니다. 
          각 지역의 특성과 문화를 고려한 맞춤형 제품을 개발합니다.</p>
          
          <h3>문화적 이해</h3>
          <p>다양한 문화권의 육아 방식을 연구하여 각 지역에 최적화된 제품을 제공합니다. 
          우리는 문화적 차이를 이해하고 존중합니다.</p>
          
          <h3>미래의 파트너십</h3>
          <p>전 세계의 파트너들과 협력하여 더 나은 육아 환경을 만들어갑니다. 
          우리는 함께 성장하며 지속 가능한 미래를 만들어갑니다.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      },
      en: {
        title: 'Global Vision',
        subtitle: 'Innovative solutions for children worldwide',
        body: `
          <h2>Expansion to the World</h2>
          <p>Sonaverse provides innovative solutions to children and parents worldwide beyond Korea. 
          We develop customized products considering the characteristics and culture of each region.</p>
          
          <h3>Cultural Understanding</h3>
          <p>We research parenting methods from various cultures to provide products optimized for each region. 
          We understand and respect cultural differences.</p>
          
          <h3>Future Partnerships</h3>
          <p>We collaborate with partners worldwide to create a better parenting environment. 
          We grow together and create a sustainable future.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    }
  },
  {
    slug: 'sustainability-future',
    youtube_url: 'https://www.youtube.com/embed/zNEH586xSts?si=q34J5DB535a1JCmc',
    tags: ['지속가능', '환경', '미래'],
    updated_by: 'admin',
    is_published: true,
    content: {
      ko: {
        title: '지속가능한 미래',
        subtitle: '환경을 생각하는 육아 솔루션',
        body: `
          <h2>환경 친화적 접근</h2>
          <p>소나버스는 지속가능한 미래를 위해 환경 친화적인 제품을 개발합니다. 
          생분해성 소재와 재활용 가능한 포장재를 사용하여 환경에 미치는 영향을 최소화합니다.</p>
          
          <h3>녹색 기술</h3>
          <p>친환경 기술을 활용하여 아이들의 건강과 지구의 건강을 동시에 지키는 제품을 만듭니다. 
          우리는 미래 세대를 위한 책임감 있는 선택을 합니다.</p>
          
          <h3>순환 경제</h3>
          <p>순환 경제의 원칙을 적용하여 자원을 효율적으로 사용합니다. 
          제품의 생명주기 전체를 고려한 지속가능한 비즈니스 모델을 추구합니다.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      },
      en: {
        title: 'Sustainable Future',
        subtitle: 'Parenting solutions that consider the environment',
        body: `
          <h2>Environmentally Friendly Approach</h2>
          <p>Sonaverse develops environmentally friendly products for a sustainable future. 
          We minimize environmental impact by using biodegradable materials and recyclable packaging.</p>
          
          <h3>Green Technology</h3>
          <p>We create products that protect both children's health and the Earth's health using eco-friendly technology. 
          We make responsible choices for future generations.</p>
          
          <h3>Circular Economy</h3>
          <p>We efficiently use resources by applying the principles of a circular economy. 
          We pursue a sustainable business model considering the entire product lifecycle.</p>
        `,
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    }
  }
];

// 데이터 삽입 함수
async function insertBrandStories() {
  try {
    // 기존 데이터 삭제
    await BrandStory.deleteMany({});
    console.log('기존 브랜드 스토리 데이터 삭제 완료');

    // 새 데이터 삽입
    const result = await BrandStory.insertMany(brandStories);
    console.log(`${result.length}개의 브랜드 스토리가 성공적으로 삽입되었습니다.`);

    // 삽입된 데이터 확인
    const insertedStories = await BrandStory.find({}).select('slug title content.ko.title is_published');
    console.log('\n삽입된 브랜드 스토리:');
    insertedStories.forEach(story => {
      console.log(`- ${story.slug}: ${story.content.ko.title} (${story.is_published ? '공개' : '비공개'})`);
    });

  } catch (error) {
    console.error('브랜드 스토리 삽입 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB 연결 종료');
  }
}

// 스크립트 실행
insertBrandStories(); 