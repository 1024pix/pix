const { expect, generateValidRequestAuthorizationHeader, nock, databaseBuilder, airtableBuilder, knex } = require('../../test-helper');
const createServer = require('../../../server');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | target-profile-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    return cache.flushAll();
  });

  describe('GET /api/admin/target-profiles/{id}', () => {
    let user;
    let targetProfileId;

    beforeEach(async () => {
      const skill = airtableBuilder.factory.buildSkill({});

      airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .returns([skill])
        .activate();

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/organizations', () => {
    let user;
    let targetProfileId;
    let organizationId;

    beforeEach(async () => {
      nock.cleanAll();
      nock('https://api.airtable.com')
        .get('/v0/test-base/Acquis')
        .query(true)
        .reply(200, {});
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });
      await databaseBuilder.commit();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.be.instanceOf(Array);
      expect(response.result.data[0].id).to.equal(organizationId.toString());
    });
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', () => {

    beforeEach(async () => {
      airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .returns([])
        .activate();

    });

    afterEach(() => {
      return knex('target-profile-shares').delete();
    });

    it ('should return 200', async () => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfile.id}/attach-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          'organization-ids': [organization1.id,  organization2.id],
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfile.id });
      const organizationIds = rows.map(({ organizationId }) => organizationId);
      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });
  });
});
