require('dotenv').config();
const { Client } = require('pg');
const credentials = [];

(async () => {

  const client = await new Client({
    connectionString: process.env.TARGET_DATABASE_URL,
  });

  await client.connect();

  const rawResult = await client.query({ text: 'SELECT "samlId" from users WHERE "samlId" IS NOT NULL', rowMode: 'array' });
  await client.end();

  const rows = rawResult.rows.splice(1);

  rows.map((element) => { credentials.push(element[0]); });
  console.log(`${credentials.length} users loaded from DB`);

})();

const pickAnExternalIDP = function() {
  const randomElement = credentials[Math.floor(Math.random() * credentials.length)];
  return (randomElement);
};

module.exports = {
  pickAnExternalIDP,
};
