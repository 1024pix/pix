import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | stage-collection', function () {
  describe('PATCH api/admin/stage-collections/{id}', function () {
    beforeEach(async function () {
      const learningContent = [{ id: 'recArea0', competences: [] }];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
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
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'stage-collections',
              attributes: {
                stages: [
                  {
                    id: null,
                    title: 'Palier 0',
                    message: 'Palier 0',
                    threshold: 0,
                    level: null,
                    prescriberTitle: null,
                    prescriberDescription: null,
                    isFirstSkill: false,
                  },
                  {
                    id: null,
                    title: 'Autre palier',
                    message: 'Autre palier',
                    threshold: 10,
                    level: null,
                    prescriberTitle: null,
                    prescriberDescription: null,
                    isFirstSkill: false,
                  },
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
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'stage-collections',
              attributes: {
                stages: [
                  {
                    id: null,
                    title: 'Palier 0',
                    message: 'Palier 0',
                    threshold: 0,
                    level: null,
                    prescriberTitle: null,
                    prescriberDescription: null,
                    isFirstSkill: false,
                  },
                  {
                    id: null,
                    title: 'Autre palier',
                    message: 'Autre palier',
                    threshold: 10,
                    level: null,
                    prescriberTitle: null,
                    prescriberDescription: null,
                    isFirstSkill: false,
                  },
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
