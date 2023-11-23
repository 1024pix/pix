import { createServer } from '../../../../../server.js';

import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  sinon,
  mockLearningContent,
  learningContentBuilder,
  knex,
} from '../../../../test-helper.js';
import { constants } from '../../../../../lib/domain/constants.js';

describe('Acceptance | API | Autonomous Course', function () {
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser.withRole().id;
    await databaseBuilder.commit();
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

  describe('POST /api/autonomous-course', function () {
    context('When user is authenticated', function () {
      let targetProfileId;
      beforeEach(async function () {
        sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        });
        targetProfileId = databaseBuilder.factory.buildTargetProfile({
          isSimplifiedAccess: true,
          ownerOrganizationId: organizationId,
        }).id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();
      });

      context('when the organization owns the target profile', function () {
        it('should return 201', async function () {
          // when
          const autonomousCourseAttributes = {
            internalTitle: 'Titre pour usage interne',
            publicTitle: 'Titre pour usage public',
            targetProfileId,
            customLandingPageText: 'customLandingPageText',
          };
          const payload = {
            data: {
              type: 'autonomous-courses',
              attributes: autonomousCourseAttributes,
            },
          };

          const options = {
            method: 'POST',
            url: '/api/autonomous-courses',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
            payload,
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.type).to.equal('autonomous-courses');
          expect(response.result.data.id).to.be.not.null;

          const campaign = await knex('campaigns').where({ id: response.result.data.id }).first();
          expect(campaign).to.exist;
        });
      });
    });
  });
});
