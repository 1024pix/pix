const moment = require('moment');
const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex, mockLearningContent, learningContentBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Badge = require('../../../../lib/domain/models/Badge');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | assessment-controller-complete-assessment', () => {

  let options;
  let server;
  let user, assessment;
  const learningContent = [
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
                  challenges: [
                    { id: 'recChallenge0_0_0' },
                  ],
                },
                {
                  id: 'recSkill0_1',
                  nom: '@recSkill0_1',
                  challenges: [
                    { id: 'recChallenge0_1_0' },
                  ],
                },
                {
                  id: 'recSkill0_2',
                  nom: '@recSkill0_2',
                  challenges: [
                    { id: 'recChallenge0_2_0' },
                  ],
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
                  challenges: [
                    { id: 'recChallenge1_0_0' },
                  ],
                },
                {
                  id: 'recSkill1_1',
                  nom: '@recSkill1_1',
                  challenges: [
                    { id: 'recChallenge1_1_0' },
                  ],
                },
                {
                  id: 'recSkill1_2',
                  nom: '@recSkill1_2',
                  challenges: [
                    { id: 'recChallenge1_2_0' },
                  ],
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
                  challenges: [
                    { id: 'recChallenge2_0_0' },
                  ],
                },
                {
                  id: 'recSkill2_1',
                  nom: '@recSkill2_1',
                  challenges: [
                    { id: 'recChallenge2_1_0' },
                  ],
                },
                {
                  id: 'recSkill2_2',
                  nom: '@recSkill2_2',
                  challenges: [
                    { id: 'recChallenge2_2_0' },
                  ],
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
                  challenges: [
                    { id: 'recChallenge3_0_0' },
                  ],
                },
                {
                  id: 'recSkill3_1',
                  nom: '@recSkill3_1',
                  challenges: [
                    { id: 'recChallenge3_1_0' },
                  ],
                },
                {
                  id: 'recSkill3_2',
                  nom: '@recSkill3_2',
                  challenges: [
                    { id: 'recChallenge3_2_0' },
                  ],
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
                  challenges: [
                    { id: 'recChallenge4_0_0' },
                  ],
                },
                {
                  id: 'recSkill4_1',
                  nom: '@recSkill4_1',
                  challenges: [
                    { id: 'recChallenge4_1_0' },
                  ],
                },
                {
                  id: 'recSkill4_2',
                  nom: '@recSkill4_2',
                  challenges: [
                    { id: 'recChallenge4_2_0' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);

    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id, state: Assessment.states.STARTED,
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

  afterEach(async () => {
    await cache.flushAll();
    return knex('assessment-results').delete();
  });

  describe('PATCH /assessments/{id}/complete-assessment', () => {

    context('when user is not the owner of the assessment', () => {

      it('should return a 401 HTTP status code', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id + 1);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when user is the owner of the assessment', () => {

      it('should complete the assessment', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when assessment belongs to a campaign', () => {
      let user;
      let targetProfile;
      let badge;

      beforeEach(() => {
        user = databaseBuilder.factory.buildUser({});
        targetProfile = databaseBuilder.factory.buildTargetProfile();
        badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
      });

      afterEach(async () => {
        await knex('badge-acquisitions').delete();
        await knex('badge-criteria').delete();
        await knex('badges').delete();
        await knex('knowledge-elements').delete();
        await knex('assessment-results').delete();
        await knex('answers').delete();
        await knex('assessments').delete();
        await knex('campaign-participations').delete();
        await knex('campaigns').delete();
        await knex('target-profiles_skills').delete();
        await knex('target-profiles').delete();
      });

      it('should create a badge when it is acquired', async () => {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
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
        const badgeAcquiredIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
          badgeIds: [badge.id],
          userId: user.id,
        });
        expect(badgeAcquiredIds).to.deep.equal([badge.id]);
      });

      it('should create a second badge when it is acquired in another campaign participation', async () => {
        // given
        const firstCampaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });
        const secondCampaign = databaseBuilder.factory.buildCampaign({
          targetProfileId: targetProfile.id,
        });

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

    });

    context('when assessment is of type certification', () => {
      let certifiableUserId;
      let certificationAssessmentId;

      beforeEach(() => {
        const limitDate = new Date('2020-01-01T00:00:00Z');
        certifiableUserId = databaseBuilder.factory.buildUser().id;

        const competenceIdSkillIdPairs = databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent({
          learningContent,
          userId: certifiableUserId,
          placementDate: limitDate,
          earnedPix: 8,
        });

        certificationAssessmentId = databaseBuilder.factory.buildAnsweredNotCompletedCertificationAssessment({
          certifiableUserId,
          competenceIdSkillIdPairs,
          limitDate: moment(limitDate).add(1, 'day').toDate(),
        }).id;
        const badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
        databaseBuilder.factory.buildBadgePartnerCompetence({
          badgeId,
          skillIds: ['recSkill0_0'],
        });

        return databaseBuilder.commit();
      });

      afterEach(async () => {
        await knex('partner-certifications').delete();
        await knex('competence-marks').delete();
        await knex('assessment-results').delete();
      });

      it('should complete the certification assessment', async () => {
        // given
        options.url = `/api/assessments/${certificationAssessmentId}/complete-assessment`;
        options.headers.authorization = generateValidRequestAuthorizationHeader(certifiableUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});

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
  const skillId = `recSkill0_${campaign.id}`;
  databaseBuilder.factory.buildTargetProfileSkill({
    targetProfileId: campaign.targetProfileId,
    skillId,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    skillId,
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
