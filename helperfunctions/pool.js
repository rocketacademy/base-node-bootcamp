import pg from 'pg';

// LINKING TO RELATED DATABASE
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'bernice',
  host: 'localhost',
  database: 'collab',
  port: 5432,
};

const pool = new Pool(pgConnectionConfigs);

export default pool;
