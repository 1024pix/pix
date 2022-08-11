require('dotenv').config();
const PgBoss = require('pg-boss');

async function main() {
  console.log('run pgboss migrations');
  const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const boss = new PgBoss(databaseUrl);
  await boss.start();
  await boss.stop();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
