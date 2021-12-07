require('dotenv').config();
const logger = require('../../lib/infrastructure/logger');
const { Client } = require('pg');

const agent = async (query, interval) => {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client(connectionString);
  await client.connect();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      logger.debug(`Submitting ${query}...`);
      await client.query(query);
      logger.debug(`${query} has been executed`);
    } catch (error) {
      logger.error(error);
    }
    await new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
  }
};

const launchAgents = async () => {
  const queries = JSON.parse(process.env.QUERIES);

  const agents = queries.flatMap((query) => {
    const promises = [];
    for (let i = 0; i < query.agentCount; i++) {
      promises.push(agent(query.text, query.interval));
    }
    return promises;
  });

  await Promise.all(agents);
};

(async () => {
  try {
    await launchAgents();
  } catch (error) {
    logger.error(error);
  }
})();
