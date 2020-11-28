require('dotenv').config();
const fs = require('fs');

const axios = require('axios');
const { Client } = require('pg');

const logTestHasStarted = async function() {

  const requestUrl = process.env.TARGET_API_URL + '/api';
  const response = await axios.get(requestUrl);

  const APIVersion = response.data.version;

  const client = await new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const startTestQuery = 'INSERT INTO test_executions (api_version) VALUES ($1)';
  const startTestValues = [APIVersion];
  await client.query(startTestQuery, startTestValues) ;
  await client.end();

};

const logTestHasEnded = async function() {

  const report = fs.readFileSync('./report/index.json');
  const reportJSON = JSON.parse(report);
  const reportString = JSON.stringify(reportJSON);

  const client = await new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const endTestQuery = 'UPDATE test_executions SET ended_at = NOW(), report=$1 WHERE ended_at IS NULL';
  const endTestValues = [reportString];
  await client.query(endTestQuery, endTestValues);
  await client.end();

};

// (async function main() {
//   await logTestHasStarted();
//   await logTestHasEnded();
// })();

module.exports = {
  logTestHasStarted,
  logTestHasEnded,
};
