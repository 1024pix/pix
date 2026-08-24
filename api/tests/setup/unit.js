// setup environment variables for unit tests
process.env.TEST_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.TEST_JOBS_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.TEST_DATAMART_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.TEST_DATAWAREHOUSE_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.TEST_REDIS_URL = '';

// Dynamic import to apply environment variables before the test suite runs
export const { mochaHooks } = await import('./common.js');
