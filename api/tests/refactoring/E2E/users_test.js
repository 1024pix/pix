const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const { knex } = require('../../../db/knex-database-connection');
const DatabaseBuilder = require('../../tooling/database-builder/database-builder');

const { createAccessToken } = require('../tooling');

const databaseBuilder = new DatabaseBuilder({ knex });

describe('GET /me', () => {
  afterEach(function() {
    return databaseBuilder.clean();
  });

  it('returns 401  when user is not authenticated', async () => {
    const  requestUrl = 'http://localhost:3000/api/users/me';
    let response = null;
    try {
      await axios.get(requestUrl);
    } catch (error) {
      response = error.response;
    }
    expect(response.status).to.equal(401);
  });

  it('returns 200 when user is authenticated', async () => {

    const userData = {
      email: 'sco@example.net',
      password: 'pix123',
    };

    databaseBuilder.factory.buildUser(userData);
    await databaseBuilder.commit();

    const accessToken = await createAccessToken(userData);

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    const requestUrl = 'http://localhost:3000/api/users/me';
    const response = await axios.get(requestUrl, config);

    expect(response.status).to.equal(200);
    expect(response.data.data.attributes.email).to.equal(userData.email);
  });

  it('returns 404 when user is not found', async () => {

    const userData = {
      email: 'sco@example.net',
      password:  'pix123',
    };
    const user = await databaseBuilder.factory.buildUser(userData);
    await databaseBuilder.commit();

    const accessToken = await createAccessToken(userData);

    await databaseBuilder.clean();

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    const requestUrl = 'http://localhost:3000/api/users/me';

    let response = null;
    try {
      await axios.get(requestUrl, config);
    } catch (error) {
      response = error.response;
    }
    expect(response.status).to.equal(404);
    expect(response.data.errors[0].detail).to.equal(`User not found for ID ${user.id}`);
  });

});
