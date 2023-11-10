import { createServer } from '../../../../../server.js';

import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | Stages', function () {
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser.withRole().id;
    server = await createServer();

    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: 'recNv8qhaY887jQb2',
            index: '1.3',
            name: 'Traiter des données',
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('PATCH /api/admin/stages/{id}', function () {
    context('When user is authenticated', function () {
      context('the stage exists', function () {
        it('should return 204', async function () {
          // given
          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
          const stageId = databaseBuilder.factory.buildStage({
            targetProfileId,
          }).id;

          await databaseBuilder.commit();

          const stageToUpdateAttributes = {
            message: 'new message',
            title: 'new title',
            prescriberTitle: 'new prescriber title',
            prescriberDescription: 'new prescriber description',
          };

          // when
          const options = {
            method: 'PATCH',
            url: `/api/admin/stages/${stageId}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
            payload: {
              data: {
                attributes: {
                  targetProfileId: targetProfileId,
                  ...stageToUpdateAttributes,
                },
              },
            },
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const [updatedStage] = await knex('stages').where({ id: stageId });
          expect(updatedStage.message).to.equal(stageToUpdateAttributes.message);
          expect(updatedStage.title).to.equal(stageToUpdateAttributes.title);
          expect(updatedStage.prescriberTitle).to.equal(stageToUpdateAttributes.prescriberTitle);
          expect(updatedStage.prescriberDescription).to.equal(stageToUpdateAttributes.prescriberDescription);
        });
      });
    });
  });
});
