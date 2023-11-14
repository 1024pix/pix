import {
  databaseBuilder,
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | stage-collection', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH api/admin/stage-collections/{id}', function () {
    beforeEach(function () {
      const learningContent = [{ id: 'recArea0', competences: [] }];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    context('when the target-profile is not linked to a campaign', function () {
      it('should return a 204 HTTP status code after updating the stage collection', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/admin/stage-collections/${targetProfile.id}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(user.id),
          },
          payload: {
            data: {
              type: 'stage-collections',
              attributes: {
                stages: [
                  domainBuilder.buildStage({ id: null, threshold: 0 }),
                  domainBuilder.buildStage({ id: null, threshold: 10 }),
                ],
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when the target-profile is linked to a campaign', function () {
      it('should return a 412 HTTP status code after updating the stage collection', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/admin/stage-collections/${targetProfile.id}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(user.id),
          },
          payload: {
            data: {
              type: 'stage-collections',
              attributes: {
                stages: [
                  domainBuilder.buildStage({ id: null, threshold: 0 }),
                  domainBuilder.buildStage({ id: null, threshold: 10 }),
                ],
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });
});
