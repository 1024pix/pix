const { expect, databaseBuilder, sinon, knex } = require('../../../test-helper');
const campaignAssessmentParticipationSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-summary-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessmentParticipationSummary = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationSummary');
const skillDatasource = require('../../../../lib/infrastructure/datasources/learning-content/skill-datasource');

describe('Integration | Repository | Campaign Assessment Participation Summary', function() {

  describe('#findPaginatedByCampaignId', function() {

    beforeEach(function() {
      sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves([]);
    });

    afterEach(function() {
      skillDatasource.findOperativeByRecordIds.restore();
      return knex('knowledge-element-snapshots').delete();
    });

    let campaign;

    context('When there is an assessment for another campaign', function() {
      beforeEach(async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        const participation1 = {
          participantExternalId: 'The good',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, {});

        const participation2 = {
          participantExternalId: 'The bad',
          campaignId: otherCampaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, {});

        const participation3 = {
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, {});

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary for each participant of the given campaign', async function() {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('When there are several assessments for the same participant', function() {

      beforeEach(async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const user = databaseBuilder.factory.buildUser();
        const participation = {
          participantExternalId: 'The good',
          campaignId: campaign.id,
          isShared: false,
          userId: user.id,
        };

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation(participation);
        const assessment1 = {
          campaignParticipationId: campaignParticipation.id,
          createdAt: new Date(2020, 1, 1),
          state: Assessment.states.ONGOING,
          userId: user.id,
        };

        databaseBuilder.factory.buildAssessment(assessment1);
        const assessment2 = {
          campaignParticipationId: campaignParticipation.id,
          createdAt: new Date(2020, 1, 2),
          state: Assessment.states.COMPLETED,
          userId: user.id,
        };

        databaseBuilder.factory.buildAssessment(assessment2);

        await databaseBuilder.commit();
      });

      it('create one CampaignAssessmentParticipationSummary from the newest assessment', async function() {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.status);

        expect(participantExternalIds).to.have.lengthOf(1);
        expect(participantExternalIds).to.exactlyContain([CampaignAssessmentParticipationSummary.statuses.COMPLETED]);
      });
    });

    context('targetedSkillIds', function() {
      beforeEach(async function() {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill1', name: '@Acqui2' },
        ];
        skillDatasource.findOperativeByRecordIds.restore();
        sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);
        const participation = { campaignId: campaign.id };

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation(participation);
        const assessment = { campaignParticipationId: campaignParticipation.id };

        databaseBuilder.factory.buildAssessment(assessment);

        await databaseBuilder.commit();
      });
      it('create CampaignAssessmentParticipationSummary with the right number of skill assessed by the campaign', async function() {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const targetedSkillCounts = campaignAssessmentParticipationSummaries.map((summary) => summary.targetedSkillCount);

        expect(targetedSkillCounts).to.exactlyContain([2]);
      });
    });

    context('validatedTargetedSkillIds', function() {
      beforeEach(async function() {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill2', name: '@Acquis2' },
          { id: 'skill3', name: '@Acquis3' },
        ];
        skillDatasource.findOperativeByRecordIds.restore();
        sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);

        const user = databaseBuilder.factory.buildUser({});

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id, userId: user.id });

        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[0].id,
          createdAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[1].id,
          createdAt: new Date('2020-01-02'),

        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[2].id,
          createdAt: new Date('2020-01-03'),
        });

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary and count only skill acquire before sharing campaignParticipation', async function() {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const validatedTargetedSkillCounts = campaignAssessmentParticipationSummaries.map((summary) => summary.validatedTargetedSkillCount);

        expect(validatedTargetedSkillCounts).to.exactlyContain([1]);
      });
    });

    context('campaignParticipationId', function() {
      let campaignParticipation;
      beforeEach(async function() {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill2', name: '@Acquis2' },
          { id: 'skill3', name: '@Acquis3' },
        ];
        skillDatasource.findOperativeByRecordIds.restore();
        sinon.stub(skillDatasource, 'findOperativeByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);

        const user = databaseBuilder.factory.buildUser({});

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id, userId: user.id });

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary with the right campaignParticipationId ', async function() {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const campaignParticipationIds = campaignAssessmentParticipationSummaries.map((summary) => summary.campaignParticipationId);

        expect(campaignParticipationIds).to.deep.equal([campaignParticipation.id]);
      });
    });

    context('order', function() {
      it('should return participants data summary ordered by last name then first name asc (including schooling registration data)', async function() {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildAssessmentCampaign({ organizationId });
        const campaignParticipation = { campaignId: campaign.id };
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Jaja', lastName: 'Le raplapla', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jiji', lastName: 'Le riquiqui', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithUser({ firstName: 'Jojo', lastName: 'Le rococo', organizationId }, campaignParticipation, true);
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ firstName: 'Juju', lastName: 'Le riquiqui', organizationId }, campaignParticipation, true);

        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const names = campaignAssessmentParticipationSummaries.map((result) => result.firstName);

        // then
        expect(names).exactlyContainInOrder(['Jaja', 'Jiji', 'Juju', 'Jojo']);
      });
    });

    context('pagination', function() {

      beforeEach(async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participation = {
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});
        databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async function() {
        const page = { size: 1, number: 1 };

        const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id, page });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', function() {
        beforeEach(async function() {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          const participation = {
            campaignId: campaign.id,
          };

          for (let i = 0; i < 11; i++) {
            databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});
          }

          await databaseBuilder.commit();
        });

        it('should return the first page with 10 elements', async function() {

          const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(10);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 10, rowCount: 11 });

        });
      });

      context('when there are zero rows', function() {
        beforeEach(async function() {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          await databaseBuilder.commit();
        });

        it('should return the first page with 1 elements', async function() {

          const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
          const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 10, rowCount: 0 });

        });
      });
    });

    context('when there is a filter on division', function() {
      it('returns participants which have the correct division', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participation1 = {
          participantExternalId: 'The good',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, { id: 1 });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: campaign.organizationId, userId: 1, division: 'Good Guys Team' });

        const participation2 = {
          participantExternalId: 'The bad',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, { id: 2 });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: campaign.organizationId, userId: 2, division: 'Bad Guys Team' });

        const participation3 = {
          participantExternalId: 'The ugly',
          campaignId: campaign.id,
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, { id: 3 });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: campaign.organizationId, userId: 3, division: 'Ugly Guys Team' });

        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id, filters: { divisions: ['Good Guys Team', 'Ugly Guys Team'] } });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });

    });

    context('when there is a filter on badges', function() {
      it('returns participants which have one badge', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const badge1 = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });
        const badge2 = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });

        const participation1 = { participantExternalId: 'The good', campaignId: campaign.id };
        const assessment1 = databaseBuilder.factory.buildAssessmentFromParticipation(participation1, { id: 1 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: assessment1.userId });

        const participation2 = { participantExternalId: 'The bad', campaignId: campaign.id };
        const assessment2 = databaseBuilder.factory.buildAssessmentFromParticipation(participation2, { id: 2 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, userId: assessment2.userId });

        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id, filters: { badges: [badge1.id] } });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
      });

      it('returns participants which have several badges', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const badge1 = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });
        const badge2 = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });

        const participation1 = { participantExternalId: 'The good', campaignId: campaign.id };
        const assessment1 = databaseBuilder.factory.buildAssessmentFromParticipation(participation1, { id: 1 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: assessment1.userId });

        const participation2 = { participantExternalId: 'The bad', campaignId: campaign.id };
        const assessment2 = databaseBuilder.factory.buildAssessmentFromParticipation(participation2, { id: 2 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: assessment2.userId });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge2.id, userId: assessment2.userId });

        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id, filters: { badges: [badge1.id, badge2.id] } });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The bad']);
      });

      it('should not return participants which has not shared but has the badge', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const badge1 = databaseBuilder.factory.buildBadge({ targetProfileId: campaign.targetProfileId });

        const participation1 = { participantExternalId: 'The good', campaignId: campaign.id, isShared: true };
        const assessment1 = databaseBuilder.factory.buildAssessmentFromParticipation(participation1, { id: 1 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: assessment1.userId });

        const participation2 = { participantExternalId: 'The bad', campaignId: campaign.id, isShared: false };
        const assessment2 = databaseBuilder.factory.buildAssessmentFromParticipation(participation2, { id: 2 });
        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge1.id, userId: assessment2.userId });

        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id, filters: { badges: [badge1.id] } });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
      });
    });

    context('when there is a filter on validated skills count', function() {
      it('returns participants which have validated skill count between one boundary', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 10, participantExternalId: 'The good', campaignId: campaign.id }, { id: 1 });
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 20, participantExternalId: 'The bad', campaignId: campaign.id }, { id: 2 });
        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { validatedSkillBoundaries: [{ from: 0, to: 15 }] },
        });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good']);
      });

      it('returns participants which have validated skill count between several boundaries', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 10, participantExternalId: 'The good', campaignId: campaign.id }, { id: 1 });
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 20, participantExternalId: 'The bad', campaignId: campaign.id }, { id: 2 });
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 30, participantExternalId: 'The ugly', campaignId: campaign.id }, { id: 3 });
        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { validatedSkillBoundaries: [{ from: 0, to: 15 }, { from: 15, to: 25 }] },
        });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The bad']);
      });

      it('"from" and "to" boundaries must be inclusive', async function() {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 10, participantExternalId: 'The good', campaignId: campaign.id }, { id: 1 });
        databaseBuilder.factory.buildAssessmentFromParticipation({ validatedSkillsCount: 20, participantExternalId: 'The bad', campaignId: campaign.id }, { id: 2 });
        await databaseBuilder.commit();

        // when
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({
          campaignId: campaign.id,
          filters: { validatedSkillBoundaries: [{ from: 10, to: 20 }] },
        });

        const participantExternalIds = campaignAssessmentParticipationSummaries.map((result) => result.participantExternalId);

        // then
        expect(participantExternalIds).to.exactlyContain(['The good', 'The bad']);
      });
    });
  });
});
