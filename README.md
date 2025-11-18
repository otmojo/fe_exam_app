# 日本語IT試験学習アプリ

本プロジェクトは、基本情報技術者試験を対象とした日本語の学習支援アプリです。選択問題の練習、IT用語カード、誤答統計、弱点分析といった機能を備え、試験対策や日常のIT日本語学習にご活用いただけます。

## 主な機能
- ユーザー管理機能：ユーザー登録、ログイン、自動ログイン機能
- 問題演習機能：日本語の選択問題、即時採点、解説表示
- 誤答統計：知識分類ごとの誤答率を表示、弱点分野を自動推薦
- IT用語カード：日本語のIT用語を例文・意味付きで分類表示
- データ永続化：全データは PostgreSQL データベースに保存

## 技術スタック
- フロントエンド：React 17
- バックエンド：Node.js + Express
- データベース：PostgreSQL
- 認証：JWT + bcryptjs

## 環境構築手順

### 1. 依存パッケージのインストール
```bash
npm install                 # バックエンドの依存をインストール
cd client && npm install   # フロントエンドの依存をインストール
```

### 2. データベースの設定
- PostgreSQL をローカル環境にインストール・起動してください
- データベース `fe_exam_app` を作成します
- プロジェクトのルートに `.env` ファイルを作成し、以下の内容を記述：

```env
DATABASE_URL=postgresql://postgres:あなたのパスワード@localhost:5432/fe_exam_app
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

**注意**：`あなたのパスワード` を、ご自身の PostgreSQL パスワードに置き換えてください

## 起動手順

### 1. データベースの起動
Windows のサービスマネージャまたはコマンドラインから PostgreSQL を起動

### 2. データベースの初期化（初回またはリセット時）
```bash
npm run init-db
```

### 3. 問題の一括インポート（任意）
```bash
node add-more-questions.js
```

### 4. バックエンドの起動
```bash
npm run server
```

### 5. フロントエンドの起動
```bash
cd client
npm start
```

### 6. アプリへアクセス
ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください

---

合格と学習のご成功を心よりお祈り申し上げます。
