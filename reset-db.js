require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fe_exam_db'
});

async function resetDatabase() {
  try {
    console.log('データベースをリセット中...');
    
    // 删除所有表（如果存在）
    await pool.query('DROP TABLE IF EXISTS user_answers CASCADE');
    await pool.query('DROP TABLE IF EXISTS it_terms CASCADE');
    await pool.query('DROP TABLE IF EXISTS questions CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ 既存のテーブルを削除しました');
    
    // 重新创建表
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        options TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        explanation TEXT
      )
    `);
    
    await pool.query(`
      CREATE TABLE it_terms (
        id SERIAL PRIMARY KEY,
        term VARCHAR(100) NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT,
        category VARCHAR(50) DEFAULT 'general'
      )
    `);
    
    await pool.query(`
      CREATE TABLE user_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        question_id INTEGER REFERENCES questions(id),
        user_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        category VARCHAR(50) NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ 新しいテーブル構造を作成しました');
    
    // 插入示例数据
    console.log('📝 サンプルデータを挿入中...');
    
    // 创建测试用户
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      ['test', hashedPassword]
    );
    console.log('✅ テストユーザーを作成しました');
    
    // 插入题目
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
    console.log('✅ 基本情報技術者サンプル問題を作成しました');
    
    // 插入IT术语
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
    console.log('✅ IT用語サンプルを作成しました');
    
    console.log('🎉 データベースのリセットが完了しました！');
    console.log('ユーザー名: test');
    console.log('パスワード: test123');
    
  } catch (err) {
    console.error('❌ データベースリセットに失敗しました:', err.message);
    console.log('\n以下の項目を確認してください：');
    console.log('1. PostgreSQL が実行中かどうか');
    console.log('2. .env ファイルの DATABASE_URL が正しいかどうか');
    console.log('3. データベースが存在するかどうか');
  } finally {
    await pool.end();
  }
}

resetDatabase(); 