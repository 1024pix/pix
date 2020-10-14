const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const { knex } = require('../../../db/knex-database-connection');

const DatabaseBuilder = require('../../tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('API /api/users/me', () => {
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
    const email = 'sco@example.net';
    const password = 'pix123';

    databaseBuilder.factory.buildUser({ email, password });
    await databaseBuilder.commit();

    const authenticateUrl = 'http://localhost:3000/api/token';
    const payload = 'grant_type=password&username=' + email + '&password=' + password + '&scope=mon-pix';

    const authenticateResponse = await axios({ method: 'post', url: authenticateUrl, data: payload });

    const config = {
      headers: { Authorization: `Bearer ${authenticateResponse.data.access_token}` },
    };

    const requestUrl = 'http://localhost:3000/api/users/me';
    const response = await axios.get(requestUrl, config);

    expect(response.status).to.equal(200);
    expect(response.data.data.attributes.email).to.equal(email);
  });

  it('returns 404 when user is not found', async () => {
    const email = 'sco@example.net';
    const password = 'pix123';

    databaseBuilder.factory.buildUser({ email, password });
    await databaseBuilder.commit();

    const authenticateUrl = 'http://localhost:3000/api/token';
    const payload = 'grant_type=password&username=' + email + '&password=' + password + '&scope=mon-pix';

    const authenticateResponse = await axios({ method: 'post', url: authenticateUrl, data: payload });
    await databaseBuilder.clean();

    const config = {
      headers: { Authorization: `Bearer ${authenticateResponse.data.access_token}` },
    };

    const requestUrl = 'http://localhost:3000/api/users/me';

    let response = null;
    try {
      await axios.get(requestUrl, config);
    } catch (error) {
      response = error.response;
    }
    expect(response.status).to.equal(404);
    expect(response.data.errors[0].detail).to.equal('User not found for ID 100000');
  });

});
