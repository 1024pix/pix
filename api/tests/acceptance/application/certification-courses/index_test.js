import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Route | Certification Courses', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/certification-courses', function () {
    context('when the certification course does not exist', function () {
      let learningContent;
      beforeEach(function () {
        learningContent = [
          {
            id: 'recArea0',
            competences: [
              {
                id: 'recCompetence0',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill0_0',
                        nom: '@recSkill0_0',
                        challenges: [{ id: 'recChallenge0_0_0' }],
                        level: 0,
                      },
                      {
                        id: 'recSkill0_1',
                        nom: '@recSkill0_1',
                        challenges: [{ id: 'recChallenge0_1_0' }],
                        level: 1,
                      },
                      {
                        id: 'recSkill0_2',
                        nom: '@recSkill0_2',
                        challenges: [{ id: 'recChallenge0_2_0' }],
                        level: 2,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence1',
                tubes: [
                  {
                    id: 'recTube1_0',
                    skills: [
                      {
                        id: 'recSkill1_0',
                        nom: '@recSkill1_0',
                        challenges: [{ id: 'recChallenge1_0_0' }],
                        level: 0,
                      },
                      {
                        id: 'recSkill1_1',
                        nom: '@recSkill1_1',
                        challenges: [{ id: 'recChallenge1_1_0' }],
                        level: 1,
                      },
                      {
                        id: 'recSkill1_2',
                        nom: '@recSkill1_2',
                        challenges: [{ id: 'recChallenge1_2_0' }],
                        level: 2,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence2',
                tubes: [
                  {
                    id: 'recTube2_0',
                    skills: [
                      {
                        id: 'recSkill2_0',
                        nom: '@recSkill2_0',
                        challenges: [{ id: 'recChallenge2_0_0' }],
                        level: 0,
                      },
                      {
                        id: 'recSkill2_1',
                        nom: '@recSkill2_1',
                        challenges: [{ id: 'recChallenge2_1_0' }],
                        level: 1,
                      },
                      {
                        id: 'recSkill2_2',
                        nom: '@recSkill2_2',
                        challenges: [{ id: 'recChallenge2_2_0' }],
                        level: 2,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence3',
                tubes: [
                  {
                    id: 'recTube3_0',
                    skills: [
                      {
                        id: 'recSkill3_0',
                        nom: '@recSkill3_0',
                        challenges: [{ id: 'recChallenge3_0_0' }],
                        level: 0,
                      },
                      {
                        id: 'recSkill3_1',
                        nom: '@recSkill3_1',
                        challenges: [{ id: 'recChallenge3_1_0' }],
                        level: 1,
                      },
                      {
                        id: 'recSkill3_2',
                        nom: '@recSkill3_2',
                        challenges: [{ id: 'recChallenge3_2_0' }],
                        level: 2,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence4',
                tubes: [
                  {
                    id: 'recTube4_0',
                    skills: [
                      {
                        id: 'recSkill4_0',
                        nom: '@recSkill4_0',
                        challenges: [{ id: 'recChallenge4_0_0' }],
                        level: 0,
                      },
                      {
                        id: 'recSkill4_1',
                        nom: '@recSkill4_1',
                        challenges: [{ id: 'recChallenge4_1_0' }],
                        level: 1,
                      },
                      {
                        id: 'recSkill4_2',
                        nom: '@recSkill4_2',
                        challenges: [{ id: 'recChallenge4_2_0' }],
                        level: 2,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence5',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill5_0',
                        nom: '@recSkill5_0',
                        challenges: [
                          { id: 'recChallenge5_0_0', langues: ['Franco Français'] },
                          { id: 'recChallenge5_0_1' },
                        ],
                        level: 0,
                      },
                      {
                        id: 'recSkill5_1',
                        nom: '@recSkill5_1',
                        challenges: [{ id: 'recChallenge5_1_1', langues: ['Franco Français'] }],
                        level: 1,
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence6',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill6_0',
                        nom: '@recSkill6_0',
                        challenges: [{ id: 'recChallenge6_0_0', langues: ['Anglais'] }],
                        level: 0,
                      },
                      {
                        id: 'recSkill6_1',
                        nom: '@recSkill6_1',
                        challenges: [{ id: 'recChallenge6_1_0', langues: ['Anglais'] }],
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);
      });
      it('should create a certification course in database', async function () {
        // given

        databaseBuilder.factory.buildUser({ id: 1 });
        databaseBuilder.factory.buildSession({ id: 2, accessCode: 'FMKP39' });
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: 2,
          userId: 1,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
          learningContent,
          userId: 1,
          earnedPix: 4,
        });

        await databaseBuilder.commit();

        // when
        await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(1),
            'accept-language': 'FR',
          },
          method: 'POST',
          payload: {
            data: {
              attributes: {
                'access-code': 'FMKP39',
                'session-id': 2,
              },
            },
          },
          url: `/api/certification-courses`,
        });

        // then
        const certificationCourse = await knex('certification-courses').select().where({ userId: 1 });
        expect(certificationCourse).to.exist;
      });
      it('should return CREATED (201) and a certification course', async function () {
        // given
        databaseBuilder.factory.buildUser({ id: 1 });
        databaseBuilder.factory.buildSession({ id: 2, accessCode: 'FMKP39' });
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: 2,
          userId: 1,
          authorizedToStart: true,
        });
        databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
          learningContent,
          userId: 1,
          earnedPix: 4,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(1),
            'accept-language': 'FR',
          },
          method: 'POST',
          payload: {
            data: {
              attributes: {
                'access-code': 'FMKP39',
                'session-id': 2,
              },
            },
          },
          url: `/api/certification-courses`,
        });

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('certification-courses');
      });
    });
  });
});
