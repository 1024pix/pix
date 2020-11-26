const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const { knex } = require('../../../db/knex-database-connection');
const DatabaseBuilder = require('../../tooling/database-builder/database-builder');
const encrypt = require('../../../lib/domain/services/encryption-service');
const { createAccessToken } = require('../tooling');

const databaseBuilder = new DatabaseBuilder({ knex });

describe('POST /{id}/attach-organizations', () => {
  afterEach(function() {
    return databaseBuilder.clean();
  });

  it('returns 204 when all everything is OK', async () => {

    const nonEncryptedPassword = 'Azerty123';
    // eslint-disable-next-line no-sync
    const userData = { email: 'sco@example.net', password: encrypt.hashPasswordSync(nonEncryptedPassword), scope: 'pix-admin' };

    databaseBuilder.factory.buildUser.withPixRolePixMaster(userData);

    await databaseBuilder.commit();

    const accessToken = await createAccessToken({ ...userData, password: nonEncryptedPassword });

    const config = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const organization = databaseBuilder.factory.buildOrganization();
    const body = { 'organization-ids': [organization.id] };
    await databaseBuilder.commit();

    const requestUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfile.id}/attach-organizations`;
    const response = await axios.post(requestUrl, body, config);

    expect(response.status).to.equal(204);
  });

  it('returns 403 when user is not Pix master', async () => {

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

    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const organization = databaseBuilder.factory.buildOrganization();
    const body = { 'organization-ids': [organization.id] };
    await databaseBuilder.commit();

    const requestUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfile.id}/attach-organizations`;
    const response = await axios.post(requestUrl, body, config);

    expect(response.status).to.equal(204);
  });

});
