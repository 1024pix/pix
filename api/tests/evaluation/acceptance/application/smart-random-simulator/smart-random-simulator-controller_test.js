import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Smart Random Simulator', function () {
  let userId;
  let server;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser.withRole().id;
    await databaseBuilder.commit();
    server = await getServer();
  });

  const buildPayload = (withChallengesMatchingUserLocale = true) => {
    return {
      data: {
        attributes: {
          knowledgeState: [
            {
              tubeId: 'tube45678765',
              floor: 3,
              ceiling: null,
              directLevels: [3],
            },
          ],
          answers: [
            {
              id: '1245',
              result: 'ok',
              challengeId: 'rec1234567',
            },
          ],
          skills: [
            {
              id: 'recoaijndozia123',
              name: '@skillname3',
              difficulty: 3,
            },
          ],
          challenges: [
            {
              id: 'challengerec1234567',
              skill: {
                id: 'recoaijndozia123',
                name: '@skillname3',
                difficulty: 3,
              },
              locales: withChallengesMatchingUserLocale ? ['fr-fr'] : ['en'],
            },
          ],
          locale: 'fr-fr',
          assessmentId: 12346,
        },
      },
    };
  };

  describe('POST /api/admin/smart-random-simulator/get-next-challenge', function () {
    context('when user is authenticated and has a role', function () {
      context('when the route should return a challenge', function () {
        let options, response;

        beforeEach(async function () {
          options = {
            method: 'POST',
            url: '/api/admin/smart-random-simulator/get-next-challenge',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: buildPayload(),
          };
          response = await server.inject(options);
        });

        it('should return a 200 status code', async function () {
          expect(response.statusCode).to.equal(200);
        });

        it('should return a challenge', async function () {
          expect(JSON.parse(response.payload).challenge.id).to.equal('challengerec1234567');
        });

        it('should return smart random details', async function () {
          expect(JSON.parse(response.payload).smartRandomLog).to.deep.equal({
            steps: [
              {
                name: 'NO_CHALLENGE',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'ALREADY_TESTED',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'EASY_TUBES',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'TIMED_SKILLS',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'TOO_DIFFICULT',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'MAX_REWARDING_SKILLS',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
              {
                name: 'RANDOM_PICK',
                outputSkills: [
                  {
                    id: 'recoaijndozia123',
                    name: '@skillname3',
                    tutorialIds: [],
                    learningMoreTutorialIds: [],
                    difficulty: 3,
                  },
                ],
              },
            ],
            predictedLevel: 3.5,
            skillRewards: [
              {
                skillId: 'recoaijndozia123',
                reward: 1,
              },
            ],
          });
        });
      });

      context('when the route should not return a challenge', function () {
        let options, response;

        beforeEach(async function () {
          options = {
            method: 'POST',
            url: '/api/admin/smart-random-simulator/get-next-challenge',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: buildPayload(false),
          };
          response = await server.inject(options);
        });

        it('should return a 200 status code', async function () {
          expect(response.statusCode).to.equal(200);
        });

        it('should return smart random details and no challenge', async function () {
          expect(JSON.parse(response.payload).challenge).to.be.null;
          expect(JSON.parse(response.payload).smartRandomLog).to.exist;
        });
      });

      context('when the user has validated some skills', function () {
        it('should return the pix score earned by the simulated user', async function () {
          // given
          const payload = buildPayload();
          payload.data.attributes.skills[0].pixValue = 2.6;
          payload.data.attributes.skills[0].competenceId = 'competenceId';
          // the skill carries no tubeId: it stands alone in its own tube, keyed by its id
          payload.data.attributes.knowledgeState[0].tubeId = 'recoaijndozia123';

          const options = {
            method: 'POST',
            url: '/api/admin/smart-random-simulator/get-next-challenge',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.payload).pixScore).to.equal(2);
        });
      });
    });
  });
});
