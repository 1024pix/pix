const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex, airtableBuilder, sinon } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | assessment-controller-complete-assessment', () => {

  let options;
  let server;
  let user, assessment;
  let competencesAssociatedSkillsAndChallenges;

  before(() => {
    const learningContentForCertification = airtableBuilder.factory.buildLearningContentForCertification();
    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([learningContentForCertification.area])
      .activate();
    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns(learningContentForCertification.competences)
      .activate();
    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns(learningContentForCertification.skills)
      .activate();
    airtableBuilder.mockList({ tableName: 'Epreuves' })
      .returns(learningContentForCertification.challenges)
      .activate();
    competencesAssociatedSkillsAndChallenges = learningContentForCertification.competencesAssociatedSkillsAndChallenges;
  });

  after(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({});
    assessment = databaseBuilder.factory.buildAssessment({
      userId: user.id, state: Assessment.states.STARTED
    });

    await databaseBuilder.commit();

    options = {
      method: 'PATCH',
      url: `/api/assessments/${assessment.id}/complete-assessment`,
      headers: {
        authorization: generateValidRequestAuthorizationHeader(user.id)
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

      let badge, campaignUser;

      beforeEach(async () => {
        campaignUser = databaseBuilder.factory.buildUser({});
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, userId: campaignUser.id });
        const campaignAssessment = databaseBuilder.factory.buildAssessment({
          id: 5,
          type: 'SMART_PLACEMENT',
          state: Assessment.states.STARTED,
          userId: campaignUser.id,
          campaignParticipationId: campaignParticipation.id
        });
        const targetProfileId = campaign.targetProfileId;
        const anyDateBeforeCampaignParticipation = new Date(campaignParticipation.sharedAt.getTime() - 60 * 1000);
        badge = databaseBuilder.factory.buildBadge({ targetProfileId });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: competencesAssociatedSkillsAndChallenges[0].skillId });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: competencesAssociatedSkillsAndChallenges[0].skillId,
          assessmentId: campaignAssessment.id,
          userId: campaignUser.id,
          competenceId: competencesAssociatedSkillsAndChallenges[0].competenceId,
          createdAt: anyDateBeforeCampaignParticipation
        });
        databaseBuilder.factory.buildBadgeCriterion({
          threshold: 75,
          badgeId: badge.id,
        });
        await databaseBuilder.commit();

        options.url = `/api/assessments/${campaignAssessment.id}/complete-assessment`;
        options.headers.authorization = generateValidRequestAuthorizationHeader(campaignUser.id);
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

        await server.inject(options);

        const badgeAcquiredIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
          badgeIds: [badge.id],
          userId: campaignUser.id,
        });
        expect(badgeAcquiredIds).to.deep.equal([badge.id]);
      });

    });

    context('when assessment is of type certification', () => {
      let certifiableUserId;
      let certificationAssessmentId;

      beforeEach(() => {
        certifiableUserId = databaseBuilder.factory.buildCertifiableUser({ competencesAssociatedSkillsAndChallenges }).id;
        certificationAssessmentId = databaseBuilder.factory.buildAnsweredNotCompletedCertificationAssessment({
          certifiableUserId,
          competencesAssociatedSkillsAndChallenges,
        }).id;

        sinon.stub(badgeRepository, 'findOneByKey').resolves({ badgePartnerCompetences: [] });

        return databaseBuilder.commit();
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
