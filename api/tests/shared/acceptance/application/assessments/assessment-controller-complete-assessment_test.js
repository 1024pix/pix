import _ from 'lodash';

import * as badgeAcquisitionRepository from '../../../../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import { Assessment, TrainingTrigger } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | assessment-controller-complete-assessment', function () {
  let options;
  let server;
  let user, assessment;
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

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);

    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    const configurationCreatorId = databaseBuilder.factory.buildUser().id;
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id,
      state: Assessment.states.STARTED,
    });

    databaseBuilder.factory.buildCompetenceScoringConfiguration({
      createdByUserId: configurationCreatorId,
      configuration: [
        {
          competence: '1.1',
          values: [
            {
              bounds: {
                max: 0,
                min: -5,
              },
              competenceLevel: 0,
            },
            {
              bounds: {
                max: 5,
                min: 0,
              },
              competenceLevel: 1,
            },
          ],
        },
      ],
    });
    databaseBuilder.factory.buildScoringConfiguration({ createdByUserId: configurationCreatorId });
    databaseBuilder.factory.buildFlashAlgorithmConfiguration();

    await databaseBuilder.commit();

    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/complete-assessment`,
      headers: {
        authorization: generateValidRequestAuthorizationHeader(user.id),
      },
    };
  });

  describe('PATCH /assessments/{id}/complete-assessment', function () {
    context('when user is not the owner of the assessment', function () {
      it('should return a 401 HTTP status code', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id + 1);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user is the owner of the assessment', function () {
      it('should complete the assessment', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when assessment belongs to a campaign', function () {
      let user;
      let targetProfile;
      let badge;
      let training;

      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser({});
        targetProfile = databaseBuilder.factory.buildTargetProfile();
        badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
        training = databaseBuilder.factory.buildTraining();
        databaseBuilder.factory.buildTargetProfileTraining({
          targetProfileId: targetProfile.id,
          trainingId: training.id,
        });
      });

      it('should create a badge when it is acquired', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkill0_0' });

        // when
        await _createAndCompleteCampaignParticipation({
          user,
          campaign,
          badge,
          options,
          server,
        });

        // then
        const badgeAcquiredIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
          badgeIds: [badge.id],
          userId: user.id,
        });
        expect(badgeAcquiredIds).to.deep.equal([badge.id]);
      });

      it('should create a second badge when it is acquired in another campaign participation', async function () {
        // given
        const firstCampaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: firstCampaign.id, skillId: 'recSkill0_0' });
        const secondCampaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: secondCampaign.id, skillId: 'recSkill0_0' });

        await _createAndCompleteCampaignParticipation({
          user,
          campaign: firstCampaign,
          badge,
          options,
          server,
        });

        // when
        await _createAndCompleteCampaignParticipation({
          user,
          campaign: secondCampaign,
          badge,
          options,
          server,
        });

        // then
        const badgeAcquisitions = await knex('badge-acquisitions').where({
          badgeId: badge.id,
          userId: user.id,
        });

        expect(badgeAcquisitions).to.have.lengthOf(2);
      });

      it('should create recommended trainings', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'recSkill0_0' });
        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({
          trainingId: training.id,
          threshold: 80,
          type: TrainingTrigger.types.PREREQUISITE,
        });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: 'recTube0_0',
          level: 2,
        });

        // when
        await _createAndCompleteCampaignParticipation({
          user,
          campaign,
          badge,
          options,
          server,
        });

        // then
        const recommendedTraining = await knex('user-recommended-trainings')
          .where({
            userId: user.id,
            trainingId: training.id,
          })
          .first();
        expect(recommendedTraining).to.exist;
      });
    });

    context('when assessment is of type certification', function () {
      context('when certification is v2', function () {
        let certifiableUserId;
        let certificationAssessmentId;

        beforeEach(function () {
          const limitDate = new Date('2020-01-01T00:00:00Z');
          const dateAfterLimitDate = new Date('2020-01-02T00:00:00Z');
          certifiableUserId = databaseBuilder.factory.buildUser().id;

          const competenceIdSkillIdPairs =
            databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
              learningContent,
              userId: certifiableUserId,
              placementDate: limitDate,
              earnedPix: 8,
            });

          certificationAssessmentId = databaseBuilder.factory.buildAnsweredNotCompletedCertificationAssessment({
            certifiableUserId,
            competenceIdSkillIdPairs,
            limitDate: dateAfterLimitDate,
          }).id;

          return databaseBuilder.commit();
        });

        it('should complete the certification assessment', async function () {
          // given
          options.url = `/api/assessments/${certificationAssessmentId}/complete-assessment`;
          options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

      context('when certification is v3', function () {
        describe('when user answers are normal', function () {
          it('should complete the certification assessment', async function () {
            // given
            const limitDate = new Date('2020-01-01T00:00:00Z');
            const certifiableUserId = databaseBuilder.factory.buildUser().id;

            const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
              userId: certifiableUserId,
              createdAt: limitDate,
              version: 3,
            }).id;
            const certificationAssessment = databaseBuilder.factory.buildAssessment({
              certificationCourseId,
              userId: certifiableUserId,
              state: Assessment.states.STARTED,
              type: Assessment.types.CERTIFICATION,
              createdAt: limitDate,
            });

            _buildValidAnswersAndCertificationChallenges({
              assessmentId: certificationAssessment.id,
              certificationCourseId,
            });

            await databaseBuilder.commit();

            options.url = `/api/assessments/${certificationAssessment.id}/complete-assessment`;
            options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);

            const assessmentResult = await knex('assessment-results')
              .where({
                assessmentId: certificationAssessment.id,
              })
              .first();

            expect(assessmentResult.pixScore).to.exist;
          });

          it('should register the certification challenge capacities', async function () {
            // given
            const limitDate = new Date('2020-01-01T00:00:00Z');
            const certifiableUserId = databaseBuilder.factory.buildUser().id;

            const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
              userId: certifiableUserId,
              createdAt: limitDate,
              version: 3,
            }).id;
            const certificationAssessment = databaseBuilder.factory.buildAssessment({
              certificationCourseId,
              userId: certifiableUserId,
              state: Assessment.states.STARTED,
              type: Assessment.types.CERTIFICATION,
              createdAt: limitDate,
            });

            _buildValidAnswersAndCertificationChallenges({
              assessmentId: certificationAssessment.id,
              certificationCourseId,
            });

            await databaseBuilder.commit();

            options.url = `/api/assessments/${certificationAssessment.id}/complete-assessment`;
            options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);

            const certificationChallengeCapacities = await knex('certification-challenge-capacities')
              .join(
                'certification-challenges',
                'certification-challenges.id',
                'certification-challenge-capacities.certificationChallengeId',
              )
              .where({
                courseId: certificationCourseId,
              });

            expect(certificationChallengeCapacities.length).to.equal(9);
          });
        });

        describe('when user estimatedLevel is too high', function () {
          it('should complete the certification assessment', async function () {
            // given
            const limitDate = new Date('2020-01-01T00:00:00Z');
            const certifiableUserId = databaseBuilder.factory.buildUser().id;

            const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
              userId: certifiableUserId,
              createdAt: limitDate,
              version: 3,
            }).id;
            const certificationAssessment = databaseBuilder.factory.buildAssessment({
              certificationCourseId,
              userId: certifiableUserId,
              state: Assessment.states.STARTED,
              type: Assessment.types.CERTIFICATION,
              createdAt: limitDate,
            });

            _buildValidAnswersAndCertificationChallenges({
              assessmentId: certificationAssessment.id,
              certificationCourseId,
              difficulty: 9,
            });

            await databaseBuilder.commit();

            options.url = `/api/assessments/${certificationAssessment.id}/complete-assessment`;
            options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);

            const assessmentResult = await knex('assessment-results')
              .where({
                assessmentId: certificationAssessment.id,
              })
              .first();

            expect(assessmentResult.pixScore).to.exist;

            const competenceMarks = await knex('competence-marks')
              .where({
                assessmentResultId: assessmentResult.id,
              })
              .orderBy('competenceId');

            expect(competenceMarks).to.have.length(1);

            expect(competenceMarks[0].level).to.equal(1);
          });
        });
      });
    });
  });
});

function _buildValidAnswersAndCertificationChallenges({
  certificationCourseId,
  assessmentId,
  difficulty = 0,
  competenceId = 'recCompetence0',
}) {
  const answers = _.flatten(
    _.range(0, 3).map((skillIndex) =>
      _.range(0, 3).map((level) => {
        return databaseBuilder.factory.buildAnswer({
          challengeId: `recChallenge${skillIndex}_${level}_0`,
          result: 'ok',
          assessmentId: assessmentId,
        });
      }),
    ),
  );

  const certificationChallenges = answers.map(({ challengeId }) =>
    databaseBuilder.factory.buildCertificationChallenge({
      challengeId,
      competenceId,
      courseId: certificationCourseId,
      difficulty,
      discriminant: 2,
    }),
  );

  return {
    answers,
    certificationChallenges,
  };
}

async function _createAndCompleteCampaignParticipation({ user, campaign, badge, options, server }) {
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign.id,
    userId: user.id,
  });
  const campaignAssessment = databaseBuilder.factory.buildAssessment({
    type: 'CAMPAIGN',
    state: Assessment.states.STARTED,
    userId: user.id,
    campaignParticipationId: campaignParticipation.id,
  });
  const anyDateBeforeCampaignParticipation = new Date(campaignParticipation.sharedAt.getTime() - 60 * 1000);
  databaseBuilder.factory.buildKnowledgeElement({
    skillId: 'recSkill0_0',
    assessmentId: campaignAssessment.id,
    userId: user.id,
    competenceId: 'recCompetence0',
    createdAt: anyDateBeforeCampaignParticipation,
  });
  databaseBuilder.factory.buildBadgeCriterion({
    threshold: 75,
    badgeId: badge.id,
  });

  await databaseBuilder.commit();

  options.url = `/api/assessments/${campaignAssessment.id}/complete-assessment`;
  options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
  await server.inject(options);
}
