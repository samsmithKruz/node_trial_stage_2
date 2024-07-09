const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      });
  
      // Optional: Log when connection to the database is established
      this.pool.on('connect', () => {
        console.log('Connected to the PostgreSQL database');
      });
  
      // Optional: Log any errors with the database connection
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });
    }
  
    async query(text, params) {
      this.client = await this.pool.connect();
      const res = await this.client.query(text, params);
      await this.close();
      return res;
    }
  
    async close() {
      await this.client.end();
      console.log('Closed database connection');
    }
  }
  
  module.exports = new Database();