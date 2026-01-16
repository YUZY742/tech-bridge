// 評価システムテスト用のサンプルデータ作成スクリプト
const mongoose = require('mongoose');
const User = require('../models/User');
const Circle = require('../models/Circle');
const Company = require('../models/Company');
const Support = require('../models/Support');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-bridge';

// 日付生成ヘルパー
const getDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

async function seedEvaluation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // 既存のデータをクリア
    await User.deleteMany({});
    await Circle.deleteMany({});
    await Company.deleteMany({});
    await Support.deleteMany({});
    console.log('Cleared existing data');

    // 1. 学生ユーザーを作成（異なる評価スコアになるように）
    
    // 高評価学生（技術力・継続性・貢献度すべて高い）
    const highScoreStudent = await User.create({
      email: 'highscore@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        name: '高評価太郎',
        university: '九州大学',
        department: '工学部'
      }
    });

    // 中評価学生（バランス型）
    const mediumScoreStudent = await User.create({
      email: 'mediumscore@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        name: '中評価花子',
        university: '東京工業大学',
        department: '工学部'
      }
    });

    // 低評価学生（新規・活動少ない）
    const lowScoreStudent = await User.create({
      email: 'lowscore@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        name: '新規次郎',
        university: '地方大学',
        department: '工学部'
      }
    });

    // 2. 企業ユーザーを作成
    const company1 = await User.create({
      email: 'company1@example.com',
      password: 'password123',
      role: 'company',
      profile: {
        companyName: 'テスト重工業株式会社',
        industry: '製造業'
      }
    });

    const companyProfile1 = await Company.create({
      userId: company1._id,
      companyName: 'テスト重工業株式会社',
      industry: '製造業',
      description: 'ロケット・航空機関連の製造',
      techFocus: ['流体力学', '燃焼工学', '材料工学'],
      budgetCategories: {
        recruitment: { allocated: 5000000, used: 2000000 },
        rnd: { allocated: 10000000, used: 5000000 },
        education: { allocated: 3000000, used: 1000000 }
      }
    });

    // 3. サークルを作成（高評価学生用）
    const circle1 = await Circle.create({
      name: '九州大学 QPIC（高評価）',
      description: '九州大学のロケット開発サークル。高度な技術と継続的な活動で評価が高い。',
      university: '九州大学',
      category: 'ロケット',
      currentStatus: '次回打ち上げに向けて、エンジンの燃焼試験を実施中。目標高度は10km。',
      achievements: [
        {
          contestName: '能代宇宙イベント',
          year: 2023,
          result: '優秀賞',
          description: '高度8.5kmを達成'
        },
        {
          contestName: '種子島ロケットコンテスト',
          year: 2022,
          result: '準優勝',
          description: '高度7.2kmを達成'
        }
      ],
      techStack: {
        languages: ['Python', 'C++', 'MATLAB', 'JavaScript'],
        cad: ['SolidWorks', 'Fusion 360', 'CATIA'],
        equipment: ['3Dプリンター', 'CNCフライス盤', 'レーザーカッター'],
        other: ['Arduino', 'Raspberry Pi', 'ROS']
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
            description: 'ロケット制御システム（Python/C++）'
          },
          {
            url: 'https://github.com/qpic/telemetry',
            description: 'テレメトリシステム（Python）'
          },
          {
            url: 'https://github.com/qpic/engine-design',
            description: 'エンジン設計ツール（MATLAB）'
          }
        ],
        designDocuments: [
          {
            name: 'エンジン設計図',
            url: 'https://example.com/design.pdf',
            type: 'PDF'
          },
          {
            name: '機体構造設計',
            url: 'https://example.com/structure.pdf',
            type: 'PDF'
          }
        ],
        experimentData: [
          {
            title: '燃焼試験データ（2023年10月）',
            url: 'https://example.com/data1.csv',
            date: getDate(60)
          },
          {
            title: '風洞試験データ',
            url: 'https://example.com/data2.csv',
            date: getDate(90)
          }
        ],
        activityReports: [
          {
            title: '2023年度活動報告書',
            url: 'https://example.com/report1.pdf',
            date: getDate(30)
          }
        ]
      },
      members: [{
        userId: highScoreStudent._id,
        role: 'leader',
        contributions: [
          'ロケット制御システムの開発を主導。PID制御アルゴリズムを実装し、安定性を向上させた。',
          'エンジン燃焼試験の設計と実施。データ分析により最適な燃料混合比を特定した。',
          'テレメトリシステムの構築。リアルタイムデータ取得と可視化を実現した。',
          '機体構造の設計最適化。有限要素解析により軽量化を実現した。',
          '能代宇宙イベントでの打ち上げ成功。高度8.5kmを達成し、優秀賞を獲得した。',
          '新メンバーの教育プログラムを開発。基礎から応用まで体系的に学習できるカリキュラムを作成した。',
          '予算管理と企業との交渉を担当。複数の企業から支援を獲得した。',
          '安全マニュアルの作成と更新。リスク評価と対策を文書化した。'
        ]
      }],
      activityLogs: [
        // 過去180日間の活動ログ（高頻度）
        { userId: highScoreStudent._id, activity: 'ロケット制御システムの開発', contribution: 'PID制御アルゴリズムの実装とテスト', date: getDate(5) },
        { userId: highScoreStudent._id, activity: 'エンジン燃焼試験の実施', contribution: 'データ収集と分析、最適化提案', date: getDate(8) },
        { userId: highScoreStudent._id, activity: 'テレメトリシステムの改善', contribution: 'データ取得精度の向上', date: getDate(12) },
        { userId: highScoreStudent._id, activity: '機体設計のレビュー', contribution: '構造解析と軽量化提案', date: getDate(15) },
        { userId: highScoreStudent._id, activity: '新メンバーへの技術指導', contribution: '制御システムの基礎を説明', date: getDate(18) },
        { userId: highScoreStudent._id, activity: '企業との打ち合わせ', contribution: '支援内容の提案と交渉', date: getDate(22) },
        { userId: highScoreStudent._id, activity: '風洞試験の準備', contribution: '試験計画の立案と準備', date: getDate(25) },
        { userId: highScoreStudent._id, activity: 'データ分析とレポート作成', contribution: '過去の打ち上げデータの分析', date: getDate(30) },
        { userId: highScoreStudent._id, activity: '安全マニュアルの更新', contribution: '新たなリスク評価を追加', date: getDate(35) },
        { userId: highScoreStudent._id, activity: '予算計画の見直し', contribution: '来年度の予算案を作成', date: getDate(40) },
        { userId: highScoreStudent._id, activity: 'エンジン部品の調達', contribution: '複数ベンダーとの交渉', date: getDate(45) },
        { userId: highScoreStudent._id, activity: '打ち上げ準備の進捗確認', contribution: '全体の進捗を管理', date: getDate(50) },
        { userId: highScoreStudent._id, activity: '技術文書の整備', contribution: '設計仕様書の作成', date: getDate(55) },
        { userId: highScoreStudent._id, activity: 'メンバーとの定例会議', contribution: '進捗共有と課題解決', date: getDate(60) },
        { userId: highScoreStudent._id, activity: '実験データの整理', contribution: '過去データのアーカイブ', date: getDate(65) },
        { userId: highScoreStudent._id, activity: '外部講師の招聘', contribution: '専門家による技術講習を企画', date: getDate(70) },
        { userId: highScoreStudent._id, activity: '機体組み立て', contribution: '最終組み立て作業', date: getDate(75) },
        { userId: highScoreStudent._id, activity: 'システムテスト', contribution: '全システムの統合テスト', date: getDate(80) },
        { userId: highScoreStudent._id, activity: '打ち上げ準備', contribution: '最終チェックと準備', date: getDate(85) },
        { userId: highScoreStudent._id, activity: '能代宇宙イベント参加', contribution: '打ち上げ成功、高度8.5km達成', date: getDate(90) },
        { userId: highScoreStudent._id, activity: '振り返り会議', contribution: '成功要因と改善点の分析', date: getDate(95) },
        { userId: highScoreStudent._id, activity: '次回打ち上げ計画', contribution: '目標高度10kmの計画立案', date: getDate(100) },
        { userId: highScoreStudent._id, activity: '技術調査', contribution: '最新技術の調査と評価', date: getDate(105) },
        { userId: highScoreStudent._id, activity: 'メンバー募集', contribution: '新メンバー向け説明会の開催', date: getDate(110) },
        { userId: highScoreStudent._id, activity: '予算申請', contribution: '大学への予算申請書作成', date: getDate(120) },
        { userId: highScoreStudent._id, activity: '機材メンテナンス', contribution: '3Dプリンターのメンテナンス', date: getDate(130) },
        { userId: highScoreStudent._id, activity: '技術勉強会', contribution: '流体力学の基礎を学習', date: getDate(140) },
        { userId: highScoreStudent._id, activity: '設計レビュー', contribution: 'エンジン設計のレビュー', date: getDate(150) },
        { userId: highScoreStudent._id, activity: 'データ分析', contribution: '過去データの統計分析', date: getDate(160) },
        { userId: highScoreStudent._id, activity: 'プロジェクト管理', contribution: '全体スケジュールの調整', date: getDate(170) },
        { userId: highScoreStudent._id, activity: '技術文書作成', contribution: '設計マニュアルの作成', date: getDate(180) }
      ],
      tags: ['ロケット', '九州', '高度記録', '技術力'],
      region: '九州',
      isRookie: false
    });

    // 4. サークルを作成（中評価学生用）
    const circle2 = await Circle.create({
      name: '東京工業大学 ロボコン部（中評価）',
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
        languages: ['C++', 'Python'],
        cad: ['SolidWorks'],
        equipment: ['3Dプリンター'],
        other: ['Raspberry Pi']
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
      portfolio: {
        githubRepos: [
          {
            url: 'https://github.com/robocon/control-system',
            description: 'ロボット制御システム'
          }
        ],
        designDocuments: [
          {
            name: 'マニピュレーター設計図',
            url: 'https://example.com/manipulator.pdf',
            type: 'PDF'
          }
        ],
        experimentData: [],
        activityReports: []
      },
      members: [{
        userId: mediumScoreStudent._id,
        role: 'member',
        contributions: [
          'マニピュレーターの制御プログラムを開発。',
          '画像認識システムの実装に貢献した。',
          'ロボットの組み立て作業を担当した。'
        ]
      }],
      activityLogs: [
        // 過去90日間の活動ログ（中頻度）
        { userId: mediumScoreStudent._id, activity: '制御プログラムの開発', contribution: 'マニピュレーター制御の実装', date: getDate(10) },
        { userId: mediumScoreStudent._id, activity: '画像認識の実装', contribution: 'OpenCVを使った画像処理', date: getDate(20) },
        { userId: mediumScoreStudent._id, activity: 'ロボット組み立て', contribution: '機体の組み立て作業', date: getDate(30) },
        { userId: mediumScoreStudent._id, activity: 'テスト実施', contribution: '動作テストとデバッグ', date: getDate(40) },
        { userId: mediumScoreStudent._id, activity: '技術勉強会', contribution: '機械学習の基礎を学習', date: getDate(50) },
        { userId: mediumScoreStudent._id, activity: '設計レビュー', contribution: 'マニピュレーター設計の確認', date: getDate(60) },
        { userId: mediumScoreStudent._id, activity: '部品調達', contribution: 'モーターとセンサーの発注', date: getDate(70) },
        { userId: mediumScoreStudent._id, activity: 'システム統合', contribution: '各システムの統合テスト', date: getDate(80) }
      ],
      tags: ['ロボコン', '東京', 'NHK'],
      region: '関東',
      isRookie: false
    });

    // 5. サークルを作成（低評価学生用）
    const circle3 = await Circle.create({
      name: '新規ロケットサークル（低評価）',
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
      portfolio: {
        githubRepos: [],
        designDocuments: [],
        experimentData: [],
        activityReports: []
      },
      members: [{
        userId: lowScoreStudent._id,
        role: 'leader',
        contributions: [
          'サークル設立の準備'
        ]
      }],
      activityLogs: [
        // 過去30日間の活動ログ（低頻度）
        { userId: lowScoreStudent._id, activity: 'サークル設立', contribution: '設立準備とメンバー募集', date: getDate(5) },
        { userId: lowScoreStudent._id, activity: '基礎学習', contribution: 'ロケット工学の基礎を学習', date: getDate(15) }
      ],
      tags: ['ロケット', '新規', '地方'],
      region: 'その他',
      isRookie: true
    });

    // 6. 支援データを作成
    const support1 = await Support.create({
      companyId: company1._id,
      circleId: circle1._id,
      supportType: 'funding',
      amount: 500000,
      purpose: 'エンジン部品の購入と打ち上げ費用',
      status: 'approved',
      chatRoomId: `support-${company1._id}-${circle1._id}-${Date.now()}`,
      messages: [
        {
          senderId: company1._id,
          message: '支援内容について確認させてください。',
          timestamp: getDate(10)
        },
        {
          senderId: highScoreStudent._id,
          message: 'ありがとうございます。詳細を説明させていただきます。',
          timestamp: getDate(9)
        }
      ],
      activityLogs: [
        {
          userId: highScoreStudent._id,
          activity: '支援申請',
          contribution: '企業への支援申請書を作成',
          date: getDate(10)
        }
      ]
    });

    const support2 = await Support.create({
      companyId: company1._id,
      circleId: circle2._id,
      supportType: 'equipment',
      amount: 0,
      items: [
        {
          name: '高精度モーター',
          description: 'ロボット用モーター',
          quantity: 2,
          value: 50000
        }
      ],
      purpose: 'ロボット開発用機材',
      status: 'pending',
      chatRoomId: `support-${company1._id}-${circle2._id}-${Date.now()}`,
      messages: []
    });

    // 7. サークルの支援者情報を更新
    circle1.supporters.push({
      companyId: company1._id,
      supportType: 'funding',
      amount: 500000,
      status: 'approved'
    });
    await circle1.save();

    circle2.supporters.push({
      companyId: company1._id,
      supportType: 'equipment',
      amount: 0,
      status: 'pending'
    });
    await circle2.save();

    // 8. 企業の支援サークル情報を更新
    companyProfile1.supportedCircles.push({
      circleId: circle1._id,
      supportType: 'funding',
      amount: 500000,
      status: 'approved',
      date: getDate(10)
    });
    companyProfile1.supportedCircles.push({
      circleId: circle2._id,
      supportType: 'equipment',
      amount: 0,
      status: 'pending',
      date: getDate(5)
    });
    await companyProfile1.save();

    console.log('\n✅ 評価システムテスト用サンプルデータの作成が完了しました！');
    console.log('\n作成されたデータ:');
    console.log(`- 学生ユーザー: 3名`);
    console.log(`  - 高評価学生: ${highScoreStudent.email} (${highScoreStudent.profile.name})`);
    console.log(`  - 中評価学生: ${mediumScoreStudent.email} (${mediumScoreStudent.profile.name})`);
    console.log(`  - 低評価学生: ${lowScoreStudent.email} (${lowScoreStudent.profile.name})`);
    console.log(`- 企業ユーザー: 1名`);
    console.log(`- サークル: 3つ`);
    console.log(`- 支援データ: 2件`);
    console.log('\n評価スコアの期待値:');
    console.log('- 高評価学生: 総合80点以上（技術力・継続性・貢献度すべて高い）');
    console.log('- 中評価学生: 総合50-70点（バランス型）');
    console.log('- 低評価学生: 総合40点以下（新規・活動少ない）');
    console.log('\nテスト方法:');
    console.log('1. 各学生でログイン');
    console.log('2. 学生ダッシュボードで評価スコアを確認');
    console.log('3. 期待値と比較して評価システムが正しく動作しているか確認');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding evaluation data:', error);
    process.exit(1);
  }
}

seedEvaluation();
