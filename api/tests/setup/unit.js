// setup environment variables for unit tests
process.env.DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.JOBS_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.DATAMART_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.DATAWAREHOUSE_DATABASE_URL = 'postgres://should.not.reach.db.in.unit.tests';
process.env.REDIS_URL = '';

// Dynamic import to apply environment variables before the test suite runs
export const { mochaHooks } = await import('./common.js');
