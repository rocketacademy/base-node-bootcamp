import { argv } from 'process';
import pg from 'pg';
const { Client } = pg;

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: 'raytor27',
  host: 'localhost',
  database: 'dogs_db',
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const client = new Client(pgConnectionConfigs);

// make the connection to the server
client.connect();

// create the query done callback
const whenQueryDone = (error, result) => {
  // this error is anything that goes wrong with the query
  if (error) {
    console.log('error', error);
  } else {
    // rows key has the data
    console.log(result.rows);
  }

  // close the connection
  client.end();
};

const command = process.argv[2];
switch(command) {
  case 'show':
    const sqlQuery1 = 'SELECT * FROM dogs';
    // run the SQL query
    client.query(sqlQuery1, whenQueryDone);
    break;
  case 'all-dogs':
    const sqlQuery1B = 'SELECT * FROM dogs';
    // run the SQL query
    client.query(sqlQuery1B, whenQueryDone);
    break;
  case 'dropTable':
    const sqlQuery2 = 'DROP TABLE dogs';
    client.query(sqlQuery2, whenQueryDone);
  case 'create':
    const sqlQuery3 = 'CREATE TABLE dogs (id SERIAL PRIMARY KEY, name TEXT, type TEXT, weight INTEGER )';
    client.query(sqlQuery3, whenQueryDone);
  case 'insert':
    const sqlQuery4 = `INSERT INTO dogs (name, type, weight) VALUES ('${process.argv[3]}', '${process.argv[4]}', '${process.argv[5]}' )`;
    client.query(sqlQuery4, whenQueryDone); 
  default:
    const sqlQuery0 = 'SELECT * FROM dogs';
    // run the SQL query
    client.query(sqlQuery0, whenQueryDone);
    console.log('session end');
    break;
}
