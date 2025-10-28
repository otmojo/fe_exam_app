const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fe_exam_app',
  password: 'hal',
  port: 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateCategories() {
  try {
    console.log('📝 問題分類を日本語に更新中...');
    
    // 分類のマッピング
    const categoryMapping = {
      'theory': 'テクノロジ系 - 基礎理論',
      'algorithm': 'テクノロジ系 - アルゴリズムとプログラミング',
      'hardware': 'テクノロジ系 - コンピュータ構成要素',
      'system': 'テクノロジ系 - システム構成要素',
      'software': 'テクノロジ系 - ソフトウェア',
      'interface': 'テクノロジ系 - ヒューマンインターフェース',
      'multimedia': 'テクノロジ系 - マルチメディア',
      'database': 'テクノロジ系 - データベース',
      'network': 'テクノロジ系 - ネットワーク',
      'security': 'テクノロジ系 - セキュリティ',
      'management': 'マネジメント系 - プロジェクトマネジメント',
      'service': 'マネジメント系 - サービスマネジメント',
      'strategy': 'ストラテジ系 - システム戦略',
      'business': 'ストラテジ系 - 経営戦略',
      'exam_info': '試験情報',
      'development': '開発',
      'infrastructure': 'インフラ',
      'methodology': '手法',
      'architecture': 'アーキテクチャ',
      'deployment': 'デプロイメント',
      'technology': '技術',
      'programming': 'プログラミング'
    };
    
    // 各分類を更新
    for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
      const result = await pool.query(
        'UPDATE questions SET category = $1 WHERE category = $2',
        [newCategory, oldCategory]
      );
      
      const itTermsResult = await pool.query(
        'UPDATE it_terms SET category = $1 WHERE category = $2',
        [newCategory, oldCategory]
      );
      
      console.log(`✅ ${oldCategory} → ${newCategory}: ${result.rowCount}問の更新`);
      console.log(`✅ IT用語 ${oldCategory} → ${newCategory}: ${itTermsResult.rowCount}語の更新`);
    }
    
    console.log('🎉 問題分類の日本語化が完了しました！');
    
  } catch (err) {
    console.error('❌ 分類の更新に失敗しました:', err.message);
  } finally {
    await pool.end();
  }
}

updateCategories(); 