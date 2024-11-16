import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Route | target-profiles', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/target-profiles/{id}/training-summaries', function () {
    let user;
    let targetProfileId;
    let training;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      training = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId, trainingId: training.id });
      user = databaseBuilder.factory.buildUser.withRole();

      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/training-summaries`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [
        {
          type: 'training-summaries',
          id: training.id.toString(),
          attributes: {
            'goal-threshold': undefined,
            'prerequisite-threshold': undefined,
            'is-disabled': false,
            'target-profiles-count': 1,
            title: 'title',
          },
        },
      ];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
