const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const { knex } = require('../../../db/knex-database-connection');

const DatabaseBuilder = require('../../tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('API /api/campaign-participations/{id}/campaign-participation-result', () => {
  afterEach(function() {
    return databaseBuilder.clean();
  });

  it('returns 401  when user is not authenticated', async () => {
    expect(false).to.equal(401);
  });
});
