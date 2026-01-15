// サンプルデータのシードスクリプト
const mongoose = require('mongoose');
const User = require('../models/User');
const Circle = require('../models/Circle');
const Company = require('../models/Company');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-bridge';

const sampleCircles = [
  {
    name: '九州大学 QPIC',
    description: '九州大学のロケット開発サークル。毎年、能代宇宙イベントや種子島ロケットコンテストに参加しています。',
    university: '九州大学',
    category: 'ロケット',
    currentStatus: '次回打ち上げに向けて、エンジンの燃焼試験を実施中。目標高度は10km。',
    achievements: [
      {
        contestName: '能代宇宙イベント',
        year: 2023,
        result: '優秀賞',
        description: '高度8.5kmを達成'
      }
    ],
    techStack: {
      languages: ['Python', 'C++', 'MATLAB'],
      cad: ['SolidWorks', 'Fusion 360'],
      equipment: ['3Dプリンター', 'CNCフライス盤'],
      other: ['Arduino', 'Raspberry Pi']
    },
    needs: {
      funding: {
        amount: 500000,
        purpose: 'エンジン部品の購入と打ち上げ費用',
        required: true
      },
      equipment: [
        {
          name: '高精度加速度センサー',
          description: '飛行データの記録用',
          quantity: 2
        }
      ],
      mentorship: {
        required: true,
        areas: ['流体力学', '燃焼工学']
      }
    },
    portfolio: {
      githubRepos: [
        {
          url: 'https://github.com/qpic/rocket-control',
          description: 'ロケット制御システム'
        }
      ],
      designDocuments: [
        {
          name: 'エンジン設計図',
          url: 'https://example.com/design.pdf',
          type: 'PDF'
        }
      ]
    },
    tags: ['ロケット', '九州', '高度記録'],
    region: '九州',
    isRookie: false
  },
  {
    name: '東京工業大学 ロボコン部',
    description: 'NHK学生ロボコンに出場しているロボットコンテストサークル。',
    university: '東京工業大学',
    category: 'ロボコン',
    currentStatus: '今年の大会に向けて、新しいマニピュレーターの開発中。',
    achievements: [
      {
        contestName: 'NHK学生ロボコン',
        year: 2023,
        result: '準優勝',
        description: '決勝まで進出'
      }
    ],
    techStack: {
      languages: ['C++', 'Python', 'ROS'],
      cad: ['SolidWorks'],
      equipment: ['3Dプリンター', 'レーザーカッター'],
      other: ['Raspberry Pi', 'Arduino']
    },
    needs: {
      funding: {
        amount: 300000,
        purpose: 'モーターとセンサーの購入',
        required: true
      },
      mentorship: {
        required: true,
        areas: ['機械制御', '画像認識']
      }
    },
    tags: ['ロボコン', '東京', 'NHK'],
    region: '関東',
    isRookie: false
  },
  {
    name: '名古屋大学 鳥人間プロジェクト',
    description: '鳥人間コンテストに出場する人力飛行機チーム。',
    university: '名古屋大学',
    category: '鳥人間',
    currentStatus: '新型機体の設計を開始。軽量化と効率化を目指しています。',
    achievements: [
      {
        contestName: '鳥人間コンテスト',
        year: 2023,
        result: '完走',
        description: '距離記録を更新'
      }
    ],
    techStack: {
      languages: ['MATLAB', 'Python'],
      cad: ['CATIA', 'SolidWorks'],
      equipment: ['炭素繊維', '真空成型機'],
      other: []
    },
    needs: {
      funding: {
        amount: 800000,
        purpose: '炭素繊維素材の購入',
        required: true
      },
      equipment: [
        {
          name: '炭素繊維ロール',
          description: '機体構造材用',
          quantity: 10
        }
      ]
    },
    tags: ['鳥人間', '中部', '人力飛行機'],
    region: '中部',
    isRookie: false
  },
  {
    name: '新規ロケットサークル',
    description: '今年設立された新しいロケット開発サークル。基礎から学んでいます。',
    university: '地方大学',
    category: 'ロケット',
    currentStatus: 'メンバー募集と基礎学習中。',
    techStack: {
      languages: ['Python'],
      cad: [],
      equipment: [],
      other: []
    },
    needs: {
      funding: {
        amount: 200000,
        purpose: '基礎教材と機材の購入',
        required: true
      },
      mentorship: {
        required: true,
        areas: ['ロケット工学基礎', '安全対策']
      }
    },
    tags: ['ロケット', '新規', '地方'],
    region: 'その他',
    isRookie: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // 既存のデータをクリア
    await Circle.deleteMany({});
    console.log('Cleared existing circles');

    // サンプルデータを挿入
    const circles = await Circle.insertMany(sampleCircles);
    console.log(`Inserted ${circles.length} sample circles`);

    console.log('\n✅ シードデータの作成が完了しました！');
    console.log('\n作成されたサークル:');
    circles.forEach(circle => {
      console.log(`- ${circle.name} (${circle.university})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
