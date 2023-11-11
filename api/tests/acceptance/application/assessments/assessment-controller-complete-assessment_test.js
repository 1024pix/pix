import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  mockLearningContent,
  learningContentBuilder,
} from '../../../test-helper.js';

import { Assessment, TrainingTrigger } from '../../../../lib/domain/models/index.js';
import * as badgeAcquisitionRepository from '../../../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import { createServer } from '../../../../server.js';
import _ from 'lodash';

describe('Acceptance | Controller | assessment-controller-complete-assessment', function () {
  let options;
  let server;
  let user, assessment;
  const easyChallengeParams = {
    alpha: 1,
    delta: -3,
  };
  const hardChallengeParams = {
    alpha: 1,
    delta: 3,
  };
  const learningContent = [
    {
      id: 'recArea0',
      code: 'area0',
      competences: [
        {
          id: 'recCompetence0',
          index: 'competence0',
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
          index: 'competence1',
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
          index: 'competence2',
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
          index: 'competence3',
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
        {
          id: 'recCompetence4',
          index: 'competence4',
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
      ],
    },
  ];

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);

    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id,
      state: Assessment.states.STARTED,
    });

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
        let certifiableUserId;
        let certificationAssessment;

        beforeEach(function () {
          const limitDate = new Date('2020-01-01T00:00:00Z');
          certifiableUserId = databaseBuilder.factory.buildUser().id;

          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId: certifiableUserId,
            createdAt: limitDate,
            version: 3,
          }).id;
          certificationAssessment = databaseBuilder.factory.buildAssessment({
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
          databaseBuilder.factory.buildBadge();

          return databaseBuilder.commit();
        });

        it('should complete the certification assessment', async function () {
          // given
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
      });
    });
  });
});

function _buildValidAnswersAndCertificationChallenges({ certificationCourseId, assessmentId }) {
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
      courseId: certificationCourseId,
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
