const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | Tubes', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET api/tubes/{id}/skills', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;

      await databaseBuilder.commit();
      mockLearningContent({
        tubes: [
          {
            id: 'tubeId1',
          },
          {
            id: 'tubeId2',
          },
        ],
        skills: [
          {
            id: 'skillId1',
            status: 'actif',
            tubeId: 'tubeId1',
          },
          {
            id: 'skillId2',
            status: 'actif',
            tubeId: 'tubeId1',
          },
          {
            id: 'skillId3',
            status: 'archivé',
            tubeId: 'tubeId1',
          },
          {
            id: 'skillId4',
            status: 'supprimé',
            tubeId: 'tubeId1',
          },
          {
            id: 'skillId5',
            status: 'actif',
            tubeId: 'tubeId2',
          },
        ],
      });
    });

    it('should return response code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/tubes/tubeId1/skills`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it("should return list of tube's skills", async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/tubes/tubeId1/skills`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
      expect(response.result.data).to.deep.include({
        id: 'skillId1',
        type: 'skills',
      });
      expect(response.result.data).to.deep.include({
        id: 'skillId2',
        type: 'skills',
      });
    });

    describe('if user is not super admin', function () {
      it('should return response code 403', async function () {
        // given
        userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        const options = {
          method: 'GET',
          url: `/api/tubes/123/skills`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
