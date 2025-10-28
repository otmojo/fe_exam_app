const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// 创建数据库表
const createTables = async () => {
  try {
    // 用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 基本情報技術者题库表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        options TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        explanation TEXT
      )
    `);
    
    // IT术语表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS it_terms (
        id SERIAL PRIMARY KEY,
        term VARCHAR(100) NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT,
        category VARCHAR(50) DEFAULT 'general'
      )
    `);
    
    // 用户答题记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        question_id INTEGER REFERENCES questions(id),
        user_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        category VARCHAR(50) NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('データベーステーブルが正常に作成されました');
    
    // 插入示例数据
    await insertSampleData();
    
  } catch (err) {
    console.error('テーブル作成に失敗しました:', err);
  }
};

// 插入示例数据
const insertSampleData = async () => {
  try {
    // 检查是否已有数据
    const questionCount = await pool.query('SELECT COUNT(*) FROM questions');
    const termCount = await pool.query('SELECT COUNT(*) FROM it_terms');
    
    if (parseInt(questionCount.rows[0].count) === 0) {
      // 插入基本情報技術者示例题目
      await pool.query(`
        INSERT INTO questions (question, answer, options, category, explanation) VALUES
        ('基本情報技術者試験の午前問題で、最も出題数が多い分野は？', 'テクノロジ系', '["テクノロジ系", "マネジメント系", "ストラテジ系", "その他"]', 'exam_info', 'テクノロジ系は午前問題の約60%を占める最重要分野です'),
        ('CPUの性能を表す指標として正しいのは？', 'クロック周波数', '["クロック周波数", "メモリ容量", "ハードディスク容量", "ディスプレイ解像度"]', 'hardware', 'クロック周波数はCPUの動作速度を表す重要な指標です'),
        ('OSI参照モデルの第7層は？', 'アプリケーション層', '["物理層", "データリンク層", "ネットワーク層", "アプリケーション層"]', 'network', 'アプリケーション層はユーザーに直接サービスを提供する最上位層です'),
        ('データベースの正規化で、第1正規形の条件は？', '繰り返し項目の排除', '["主キーの設定", "繰り返し項目の排除", "外部キーの設定", "インデックスの作成"]', 'database', '第1正規形では、1つのセルに複数の値を持つことを禁止します'),
        ('プロジェクトの進捗を管理する手法で、最も適切なのは？', 'ガントチャート', '["ガントチャート", "パレート図", "ヒストグラム", "散布図"]', 'management', 'ガントチャートは作業の開始・終了時期と進捗を視覚的に管理できます'),
        ('TCP/IPプロトコルで、ポート番号80は何に使用される？', 'HTTP', '["HTTP", "HTTPS", "FTP", "SMTP"]', 'network', 'ポート80はHTTP（Web）通信で使用される標準ポートです'),
        ('メモリの種類で、電源を切ると内容が消えるのは？', 'RAM', '["RAM", "ROM", "SSD", "HDD"]', 'hardware', 'RAMは揮発性メモリで、電源を切ると内容が消えます'),
        ('ソフトウェア開発で、バグの修正を行う工程は？', 'テスト', '["設計", "コーディング", "テスト", "運用"]', 'development', 'テスト工程でバグを発見し、修正を行います'),
        ('データベースで、複数のテーブルを結合する操作は？', 'JOIN', '["SELECT", "INSERT", "JOIN", "UPDATE"]', 'database', 'JOINは複数のテーブルを結合してデータを取得する操作です'),
        ('ネットワークで、IPアドレスをMACアドレスに変換するプロトコルは？', 'ARP', '["ARP", "DNS", "DHCP", "HTTP"]', 'network', 'ARPはIPアドレスからMACアドレスを取得するプロトコルです')
      `);
      console.log('基本情報技術者サンプル問題が正常に追加されました');
    }
    
    if (parseInt(termCount.rows[0].count) === 0) {
      // 插入IT术语示例
      await pool.query(`
        INSERT INTO it_terms (term, meaning, example, category) VALUES
        ('API', 'アプリケーションプログラミングインターフェース。ソフトウェア同士が連携するための仕様', 'Web APIを使用して外部サービスと連携する', 'programming'),
        ('クラウドコンピューティング', 'インターネット経由でコンピュータリソースを提供するサービス', 'AWSやAzureなどのサービスを利用する', 'infrastructure'),
        ('DevOps', '開発と運用を統合し、迅速なソフトウェア開発を実現する手法', 'CI/CDパイプラインを構築して自動化する', 'methodology'),
        ('マイクロサービス', 'アプリケーションを小さな独立したサービスに分割するアーキテクチャ', '各機能を独立したサービスとして開発・運用する', 'architecture'),
        ('コンテナ', 'アプリケーションとその実行環境をパッケージ化する技術', 'Dockerを使用してアプリケーションを配布する', 'deployment'),
        ('AI', '人工知能。人間の知能を模倣するコンピュータシステム', '機械学習を使用して予測モデルを構築する', 'technology'),
        ('IoT', 'モノのインターネット。様々なデバイスがインターネットに接続される', 'スマートホームデバイスを制御する', 'network'),
        ('ブロックチェーン', '分散型台帳技術。改ざんが困難なデータ構造', '暗号通貨の取引記録を管理する', 'security'),
        ('SQL', 'データベースを操作するための言語', 'SELECT文でデータを取得する', 'database'),
        ('HTTP', 'Webブラウザとサーバー間でデータをやり取りするプロトコル', 'Webサイトにアクセスする際に使用される', 'network'),
        ('RAM', 'ランダムアクセスメモリ。コンピュータの主記憶装置', 'プログラムの実行中にデータを一時保存する', 'hardware'),
        ('CPU', '中央処理装置。コンピュータの頭脳として働く', '計算や制御を行う重要な部品', 'hardware'),
        ('DNS', 'ドメインネームシステム。URLをIPアドレスに変換する', 'www.example.comをIPアドレスに変換する', 'network'),
        ('SSL', 'セキュアソケットレイヤー。暗号化通信を提供する', 'HTTPSで安全なWeb通信を実現する', 'security'),
        ('Git', 'バージョン管理システム。ソースコードの変更履歴を管理する', 'チーム開発でコードの変更を追跡する', 'development')
      `);
      console.log('IT用語サンプルが正常に追加されました');
    }
    
  } catch (err) {
    console.error('サンプルデータの挿入に失敗しました:', err);
  }
};

// 初始化数据库
createTables();

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードを入力してください' });
  }
  
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'ユーザー名が既に存在します' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.json({ message: '登録が完了しました' });
  } catch (err) {
    console.error('登録エラー:', err);
    res.status(500).json({ error: '登録に失敗しました' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードを入力してください' });
  }
  
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'ユーザー名が存在しません' });
    }
    
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'パスワードが間違っています' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '24h' }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('ログインエラー:', err);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// 获取题库
app.get('/api/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10');
    
    // 处理选项数据，将JSON字符串转换为数组
    const questions = result.rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    }));
    
    res.json(questions);
  } catch (err) {
    console.error('問題取得エラー:', err);
    res.status(500).json({ error: '問題の取得に失敗しました' });
  }
});

// 保存用户答题记录
app.post('/api/answers', async (req, res) => {
  const { userId, questionId, userAnswer, isCorrect, category } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO user_answers (user_id, question_id, user_answer, is_correct, category) VALUES ($1, $2, $3, $4, $5)',
      [userId, questionId, userAnswer, isCorrect, category]
    );
    res.json({ message: '回答が記録されました' });
  } catch (err) {
    console.error('回答記録エラー:', err);
    res.status(500).json({ error: '回答の記録に失敗しました' });
  }
});

// 获取用户答题统计
app.get('/api/statistics/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // 按分类统计正确和错误次数
    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as incorrect
      FROM user_answers 
      WHERE user_id = $1 
      GROUP BY category
    `, [userId]);
    
    // 计算错误率
    const statistics = categoryStats.rows.map(row => ({
      category: row.category,
      total: parseInt(row.total),
      correct: parseInt(row.correct),
      incorrect: parseInt(row.incorrect),
      errorRate: row.total > 0 ? (parseInt(row.incorrect) / parseInt(row.total) * 100).toFixed(1) : 0
    }));
    
    res.json(statistics);
  } catch (err) {
    console.error('統計取得エラー:', err);
    res.status(500).json({ error: '統計の取得に失敗しました' });
  }
});

// 根据错误率推荐IT术语
app.get('/api/recommended-terms/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // 获取用户答题统计
    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as incorrect
      FROM user_answers 
      WHERE user_id = $1 
      GROUP BY category
    `, [userId]);
    
    // 找出错误率最高的分类
    const highErrorCategories = categoryStats.rows
      .filter(row => row.total > 0)
      .map(row => ({
        category: row.category,
        errorRate: (parseInt(row.incorrect) / parseInt(row.total) * 100).toFixed(1)
      }))
      .filter(item => parseFloat(item.errorRate) > 30) // 错误率超过30%的分类
      .sort((a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate));
    
    // 根据错误率高的分类推荐IT术语
    let recommendedTerms = [];
    if (highErrorCategories.length > 0) {
      const categories = highErrorCategories.map(item => item.category);
      const result = await pool.query(`
        SELECT * FROM it_terms 
        WHERE category = ANY($1) 
        ORDER BY RANDOM() 
        LIMIT 10
      `, [categories]);
      recommendedTerms = result.rows;
    } else {
      // 如果没有高错误率分类，推荐所有术语
      const result = await pool.query('SELECT * FROM it_terms ORDER BY RANDOM() LIMIT 10');
      recommendedTerms = result.rows;
    }
    
    res.json({
      highErrorCategories,
      recommendedTerms
    });
  } catch (err) {
    console.error('推奨用語取得エラー:', err);
    res.status(500).json({ error: '推奨用語の取得に失敗しました' });
  }
});

// 获取IT术语
app.get('/api/it-terms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM it_terms ORDER BY RANDOM() LIMIT 20');
    res.json(result.rows);
  } catch (err) {
    console.error('IT用語取得エラー:', err);
    res.status(500).json({ error: 'IT用語の取得に失敗しました' });
  }
});

// 添加新题目
app.post('/api/questions', async (req, res) => {
  const { question, answer, options, category, explanation } = req.body;
  
  if (!question || !answer || !options) {
    return res.status(400).json({ error: '問題、答え、選択肢を入力してください' });
  }
  
  try {
    await pool.query(
      'INSERT INTO questions (question, answer, options, category, explanation) VALUES ($1, $2, $3, $4, $5)',
      [question, answer, JSON.stringify(options), category || 'general', explanation]
    );
    res.json({ message: '問題が正常に追加されました' });
  } catch (err) {
    console.error('問題追加エラー:', err);
    res.status(500).json({ error: '問題の追加に失敗しました' });
  }
});

// 添加新IT术语
app.post('/api/it-terms', async (req, res) => {
  const { term, meaning, example, category } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO it_terms (term, meaning, example, category) VALUES ($1, $2, $3, $4)',
      [term, meaning, example, category || 'general']
    );
    res.json({ message: 'IT用語が正常に追加されました' });
  } catch (err) {
    console.error('IT用語追加エラー:', err);
    res.status(500).json({ error: 'IT用語の追加に失敗しました' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で実行中です`);
  console.log(`フロントエンドアドレス: http://localhost:3000`);
});