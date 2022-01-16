import pg from 'pg';

const { Client } = pg;

const client = new Client({
  user: '<YOUR_USERNAME>',
  host: 'localhost',
  database: '<YOUR_DATABASE_NAME>',
  port: 5432,
});

client.connect();
console.log('successfully connected');

let sqlQuery = '';
let inputData = [];
const now = new Date();

const whenQueryDone = (err, result) => {
  if (err) {
    console.log('error', err);
  } else {
    console.log(result.rows);
    // here we are customising the report output format
    if (process.argv[2] === 'report') {
      let hungerState;
      result.rows.forEach((report) => {
        if (report.was_hungry_before_eating === true) {
          hungerState = 'feeling hungry';
        } else {
          hungerState = 'not hungry';
        }

        // this is the output
        console.log(`${report.id}. ${report.type} - ${report.description} - ${report.amount_of_alcohol} - ${hungerState}`);
      });
    }
  }

  client.end();
};

if (process.argv[2] === 'log') {
  sqlQuery = 'INSERT INTO meals (type, description, amount_of_alcohol, was_hungry_before_eating, created_at) VALUES ($1, $2, $3, $4, $5)';

  inputData = [process.argv[3], process.argv[4], Number(process.argv[5]), process.argv[6], now];

  client.query(sqlQuery, inputData, whenQueryDone);
}

if (process.argv[2] === 'report') {
  sqlQuery = 'SELECT * FROM meals';

  client.query(sqlQuery, whenQueryDone);
}
