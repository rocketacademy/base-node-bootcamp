import { Router } from 'express';

import pg from 'pg';
// import db from './models/index.mjs';

const { Pool } = pg;
const poolConfig = {
  user: 'bernice',
  host: 'localhost',
  database: 'collab',
  port: 5432,
};

const pool = new Pool(poolConfig);

export default function routes(app) {
  // Where we init our controllers, we can also pass in pool.
  const itemsController = initItemsController(db, pool);

  // ...
}
