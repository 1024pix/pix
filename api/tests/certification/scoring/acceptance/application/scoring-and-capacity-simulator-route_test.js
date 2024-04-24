import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | Application | scoring-and-capacity-simulator-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/simulate-score-or-capacity', function () {
    describe('when called without being authenticated', function () {
      it('should return a 401', async function () {
        // given
        const options = {
          method: 'POST',
          url: '/api/admin/simulate-score-or-capacity',
        };
        // when
        const response = await server.inject(options);
        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    describe('when called without a super admin role', function () {
      it('should return a 403', async function () {
        // given
        const authorization = generateValidRequestAuthorizationHeader();

        const options = {
          method: 'POST',
          url: '/api/admin/simulate-score-or-capacity',
          headers: {
            authorization,
          },
          payload: {
            data: {
              capacity: 1,
              score: undefined,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('when called with a super admin role', function () {
      describe('when called with an invalid payload', function () {
        it('should return a 400', async function () {
          // given
          const superAdmin = databaseBuilder.factory.buildUser.withRole({
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          });

          await databaseBuilder.commit();

          const authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

          const options = {
            method: 'POST',
            url: '/api/admin/simulate-score-or-capacity',
            headers: {
              authorization,
            },
            payload: {
              data: {
                toto: 1,
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      describe('when called with a valid payload', function () {
        it('should return a 200 and the simulation result', async function () {
          // given
          const easyChallengeParams = {
            alpha: 1,
            delta: -3,
            langues: ['Franco Français'],
          };
          const hardChallengeParams = {
            alpha: 1,
            delta: 3,
            langues: ['Franco Français'],
          };
          const learningContent = [
            {
              id: 'recArea0',
              code: 'area0',
              competences: [
                {
                  id: 'recCompetence0',
                  index: '1.1',
                  tubes: [
                    {
                      id: 'recTube0_0',
                      skills: [
                        {
                          id: 'recSkill0_0',
                          nom: '@recSkill0_0',
                          level: 2,
                          challenges: [{ id: 'recChallenge0_0_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill0_1',
                          nom: '@recSkill0_1',
                          challenges: [{ id: 'recChallenge0_1_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill0_2',
                          nom: '@recSkill0_2',
                          challenges: [{ id: 'recChallenge0_2_0', ...hardChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence1',
                  index: '1.2',
                  tubes: [
                    {
                      id: 'recTube1_0',
                      skills: [
                        {
                          id: 'recSkill1_0',
                          nom: '@recSkill1_0',
                          challenges: [{ id: 'recChallenge1_0_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill1_1',
                          nom: '@recSkill1_1',
                          challenges: [{ id: 'recChallenge1_1_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill1_2',
                          nom: '@recSkill1_2',
                          challenges: [{ id: 'recChallenge1_2_0', ...hardChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence2',
                  index: '1.3',
                  tubes: [
                    {
                      id: 'recTube2_0',
                      skills: [
                        {
                          id: 'recSkill2_0',
                          nom: '@recSkill2_0',
                          challenges: [{ id: 'recChallenge2_0_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill2_1',
                          nom: '@recSkill2_1',
                          challenges: [{ id: 'recChallenge2_1_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill2_2',
                          nom: '@recSkill2_2',
                          challenges: [{ id: 'recChallenge2_2_0', ...hardChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence3',
                  index: '1.4',
                  tubes: [
                    {
                      id: 'recTube3_0',
                      skills: [
                        {
                          id: 'recSkill3_0',
                          nom: '@recSkill3_0',
                          challenges: [{ id: 'recChallenge3_0_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill3_1',
                          nom: '@recSkill3_1',
                          challenges: [{ id: 'recChallenge3_1_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill3_2',
                          nom: '@recSkill3_2',
                          challenges: [{ id: 'recChallenge3_2_0', ...hardChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recArea1',
              code: 'area1',
              competences: [
                {
                  id: 'recCompetence4',
                  index: '2.1',
                  tubes: [
                    {
                      id: 'recTube4_0',
                      skills: [
                        {
                          id: 'recSkill4_0',
                          nom: '@recSkill4_0',
                          challenges: [{ id: 'recChallenge4_0_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill4_1',
                          nom: '@recSkill4_1',
                          challenges: [{ id: 'recChallenge4_1_0', ...easyChallengeParams }],
                        },
                        {
                          id: 'recSkill4_2',
                          nom: '@recSkill4_2',
                          challenges: [{ id: 'recChallenge4_2_0', ...hardChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence5',
                  index: '2.2',
                  tubes: [
                    {
                      id: 'recTube4_0',
                      skills: [
                        {
                          id: 'recSkill5_0',
                          nom: '@recSkill5_0',
                          challenges: [{ id: 'recChallenge5_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence6',
                  index: '2.3',
                  tubes: [
                    {
                      id: 'recTube4_0',
                      skills: [
                        {
                          id: 'recSkill6_0',
                          nom: '@recSkill6_0',
                          challenges: [{ id: 'recChallenge6_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence7',
                  index: '2.4',
                  tubes: [
                    {
                      id: 'recTube7_0',
                      skills: [
                        {
                          id: 'recSkill7_0',
                          nom: '@recSkill7_0',
                          challenges: [{ id: 'recChallenge7_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recArea2',
              code: 'area2',
              competences: [
                {
                  id: 'recCompetence8',
                  index: '3.1',
                  tubes: [
                    {
                      id: 'recTube8_0',
                      skills: [
                        {
                          id: 'recSkill8_0',
                          nom: '@recSkill8_0',
                          challenges: [{ id: 'recChallenge8_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence9',
                  index: '3.2',
                  tubes: [
                    {
                      id: 'recTube9_0',
                      skills: [
                        {
                          id: 'recSkill9_0',
                          nom: '@recSkill9_0',
                          challenges: [{ id: 'recChallenge9_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence10',
                  index: '3.3',
                  tubes: [
                    {
                      id: 'recTube10_0',
                      skills: [
                        {
                          id: 'recSkill10_0',
                          nom: '@recSkill10_0',
                          challenges: [{ id: 'recChallenge10_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence11',
                  index: '3.4',
                  tubes: [
                    {
                      id: 'recTube11_0',
                      skills: [
                        {
                          id: 'recSkill11_0',
                          nom: '@recSkill11_0',
                          challenges: [{ id: 'recChallenge11_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recArea3',
              code: 'area3',
              competences: [
                {
                  id: 'recCompetence12',
                  index: '4.1',
                  tubes: [
                    {
                      id: 'recTube4_0',
                      skills: [
                        {
                          id: 'recSkill12_0',
                          nom: '@recSkill12_0',
                          challenges: [{ id: 'recChallenge12_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence13',
                  index: '4.2',
                  tubes: [
                    {
                      id: 'recTube13_0',
                      skills: [
                        {
                          id: 'recSkill13_0',
                          nom: '@recSkill13_0',
                          challenges: [{ id: 'recChallenge13_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence14',
                  index: '4.3',
                  tubes: [
                    {
                      id: 'recTube14_0',
                      skills: [
                        {
                          id: 'recSkill14_0',
                          nom: '@recSkill14_0',
                          challenges: [{ id: 'recChallenge14_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recArea4',
              code: 'area4',
              competences: [
                {
                  id: 'recCompetence15',
                  index: '5.1',
                  tubes: [
                    {
                      id: 'recTube15_0',
                      skills: [
                        {
                          id: 'recSkill15_0',
                          nom: '@recSkill15_0',
                          challenges: [{ id: 'recChallenge15_0_0', ...easyChallengeParams }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'recCompetence16',
                  index: '5.2',
                  tubes: [
                    {
                      id: 'recTube16_0',
                      skills: [
                        {
                          id: 'recSkill16_0',
                          nom: '@recSkill16_0',
                          challenges: [{ id: 'recChallenge16_0_0', ...easyChallengeParams }],
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

          const superAdmin = databaseBuilder.factory.buildUser.withRole({
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          });

          databaseBuilder.factory.buildScoringConfiguration({
            createdByUserId: superAdmin.id,
          });

          const competenceScoringConfiguration = [
            {
              competence: '1.1',
              values: [
                { bounds: { max: -2, min: -8 }, competenceLevel: 0 },
                { bounds: { max: -0.5, min: -2 }, competenceLevel: 1 },
                { bounds: { max: 0.6, min: -0.5 }, competenceLevel: 2 },
                { bounds: { max: 1.5, min: 0.6 }, competenceLevel: 3 },
                { bounds: { max: 2.25, min: 1.5 }, competenceLevel: 4 },
                { bounds: { max: 3.1, min: 2.25 }, competenceLevel: 5 },
                { bounds: { max: 4, min: 3.1 }, competenceLevel: 6 },
                { bounds: { max: 8, min: 4 }, competenceLevel: 7 },
              ],
            },
          ];

          databaseBuilder.factory.buildCompetenceScoringConfiguration({
            createdByUserId: superAdmin.id,
            configuration: competenceScoringConfiguration,
          });

          await databaseBuilder.commit();

          const authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

          const options = {
            method: 'POST',
            url: '/api/admin/simulate-score-or-capacity',
            headers: {
              authorization,
            },
            payload: {
              data: {
                score: 128,
                capacity: undefined,
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.deep.equal({
            type: 'scoring-and-capacity-simulator-reports',
            attributes: {
              capacity: -6,
              score: 128,
              competences: [
                {
                  competenceCode: '1.1',
                  level: 0,
                },
              ],
            },
          });
        });
      });
    });
  });
});
