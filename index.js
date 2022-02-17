import { argv } from 'process';
import pg from 'pg';
const { Client } = pg;

// set the way we will connect to the server
const pgConnectionConfigs = {
  user: 'raytor27',
  host: 'localhost',
  database: 'mealkeeper',
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

/* to show db Entries */
const sqlQuery1 = 'SELECT * FROM meals';
/* to delete entire table!! */
const sqlQuery2 = 'DROP TABLE meals';
/* create table header for meal logging */
const sqlQuery3 = 'CREATE TABLE meals (id SERIAL PRIMARY KEY, meal_type TEXT, description TEXT, amt_of__alcohol_mL INTEGER, was_hungry_b4_eating BOOLEAN )';
/* Inserting meal logs */
const sqlQuery4 = `INSERT INTO meals (meal_type, description, amt_of__alcohol_mL, was_hungry_b4_eating ) VALUES ('${process.argv[3]}', '${process.argv[4]}', '${process.argv[5]}', '${process.argv[6]}' )`;
/* to show table in customised format in bash terminal */
const sqlQuery1B = 'SELECT * FROM meals';
/* edit entry node index.js <command(2)> <id(3)> <Col Name(4)> <New Value(5)> !! only 1 cell at a time */
const editSqlQuery = `UPDATE meals SET ${process.argv[4]} = '${process.argv[5]}' WHERE id=${process.argv[3]}`
const sqlQuery0 = 'SELECT * FROM meals';

const command = process.argv[2];
switch (command) {
  case 'show':
    // run the SQL query
    client.query(sqlQuery1, whenQueryDone);
    break;
  case 'dropTable':
    client.query(sqlQuery2, whenQueryDone);
    break;
  case 'create':
    client.query(sqlQuery3, whenQueryDone);
    break;
  case 'log':
    client.query(sqlQuery4, whenQueryDone);
    break;
  case 'edit':
    // run the SQL query
    client.query(editSqlQuery, whenQueryDone);
  break;
  case 'report':
    // run the SQL query
    console.log(typeof(process.argv[2]));
    client.query(sqlQuery1B, whenQueryDone);
    break;
  default:
    // run the SQL query
    client.query(sqlQuery0, whenQueryDone);
    console.log('session end');
    break;
}
