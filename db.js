require('dotenv').config();
const { Pool } = require('pg');

// 数据库连接配置
if (!process.env.DATABASE_URL) {
  throw new Error('环境变量 DATABASE_URL 未设置。请在项目根目录创建 .env（参考 .env.example）');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('数据库连接成功');
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
});

module.exports = pool;