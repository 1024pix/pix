const { Client } = require('pg');

async function runDBOperation(callback) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

module.exports = {
  runDBOperation,
};
