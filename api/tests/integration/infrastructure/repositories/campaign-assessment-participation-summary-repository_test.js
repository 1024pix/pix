const { expect, databaseBuilder, sinon } = require('../../../test-helper');
const campaignAssessmentParticipationSummaryRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-participation-summary-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessmentParticipationSummary = require('../../../../lib/domain/read-models/CampaignAssessmentParticipationSummary');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | Campaign Assessment Participation Summary', () => {

  describe('#findPaginatedByCampaignId', () => {

    beforeEach(() => {
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([]);
    });

    afterEach(() => {
      skillDatasource.findByRecordIds.restore();
    });

    let campaign;

    context('When there is an assessment for another campaign', () => {
      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        const participation1 = {
          participantExternalId: 'The good',
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, {});

        const participation2 = {
          participantExternalId: 'The bad',
          campaignId: otherCampaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, {});

        const participation3 = {
          participantExternalId: 'The ugly',
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, {});

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary for each participant of the given campaign', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.exactlyContain(['The good', 'The ugly']);
      });
    });

    context('When there are several assessments for the same participant', () => {

      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});
        const user = databaseBuilder.factory.buildUser();
        const participation = {
          participantExternalId: 'The good',
          campaignId: campaign.id,
          isShared: false,
          userId: user.id
        };

        const campaignParticipation =  databaseBuilder.factory.buildCampaignParticipation(participation);
        const assessment1 = {
          campaignParticipationId: campaignParticipation.id,
          createdAt: new Date(2020, 1, 1),
          state: Assessment.states.ONGOING,
          userId: user.id
        };

        databaseBuilder.factory.buildAssessment(assessment1);
        const assessment2 = {
          campaignParticipationId: campaignParticipation.id,
          createdAt: new Date(2020, 1, 2),
          state: Assessment.states.COMPLETED,
          userId: user.id
        };

        databaseBuilder.factory.buildAssessment(assessment2);

        await databaseBuilder.commit();
      });

      it('create one CampaignAssessmentParticipationSummary from the newest assessment', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.status);

        expect(participantExternalIds).to.have.lengthOf(1);
        expect(participantExternalIds).to.exactlyContain([CampaignAssessmentParticipationSummary.statuses.COMPLETED]);
      });
    });

    context('targetedSkillIds', () => {
      beforeEach(async () => {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill1', name: '@Acqui2' }
        ];
        skillDatasource.findByRecordIds.restore();
        sinon.stub(skillDatasource, 'findByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);
        const participation = { campaignId: campaign.id };

        const campaignParticipation =  databaseBuilder.factory.buildCampaignParticipation(participation);
        const assessment = { campaignParticipationId: campaignParticipation.id };

        databaseBuilder.factory.buildAssessment(assessment);

        await databaseBuilder.commit();
      });
      it('create CampaignAssessmentParticipationSummary with the right number of skill assessed by the campaign', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const targetedSkillCounts = campaignAssessmentParticipationSummaries.map((summary) => summary.targetedSkillCount);

        expect(targetedSkillCounts).to.exactlyContain([2]);
      });
    });

    context('validatedTargetedSkillIds', () => {
      beforeEach(async () => {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill2', name: '@Acquis2' },
          { id: 'skill3', name: '@Acquis3' }
        ];
        skillDatasource.findByRecordIds.restore();
        sinon.stub(skillDatasource, 'findByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);

        const user = databaseBuilder.factory.buildUser({});

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          isShared: true,
          sharedAt: new Date('2020-01-02')
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id, userId: user.id });

        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[0].id,
          createdAt: new Date('2020-01-01')
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[1].id,
          createdAt: new Date('2020-01-02')

        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          skillId: skills[2].id,
          createdAt: new Date('2020-01-03')
        });

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary and count only skill acquire before sharing campaignParticipation', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const validatedTargetedSkillCounts = campaignAssessmentParticipationSummaries.map((summary) => summary.validatedTargetedSkillCount);

        expect(validatedTargetedSkillCounts).to.exactlyContain([1]);
      });
    });

    context('campaignParticipationId', () => {
      let campaignParticipation;
      beforeEach(async () => {
        const skills = [
          { id: 'skill1', name: '@Acquis1' },
          { id: 'skill2', name: '@Acquis2' },
          { id: 'skill3', name: '@Acquis3' }
        ];
        skillDatasource.findByRecordIds.restore();
        sinon.stub(skillDatasource, 'findByRecordIds').resolves(skills);

        campaign = databaseBuilder.factory.buildAssessmentCampaignForSkills({}, skills);

        const user = databaseBuilder.factory.buildUser({});

        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId: user.id,
          sharedAt: new Date('2020-01-02')
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id, userId: user.id });

        await databaseBuilder.commit();
      });

      it('create CampaignAssessmentParticipationSummary with the right campaignParticipationId ', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const campaignParticipationIds = campaignAssessmentParticipationSummaries.map((summary) => summary.campaignParticipationId);

        expect(campaignParticipationIds).to.deep.equal([campaignParticipation.id]);
      });
    });

    context('order', () => {
      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participant1 = {
          lastName: 'McClane',
          firstName: 'John'
        };
        const participation1 = {
          participantExternalId: 'Third',
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation1, participant1);

        const participant2 = {
          lastName: 'Gruber',
          firstName: 'Hans'
        };
        const participation2 = {
          participantExternalId: 'First',
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation2, participant2);

        const participant3 = {
          lastName: 'Holly',
          firstName: 'McClane'
        };
        const participation3 = {
          participantExternalId: 'Second',
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation3, participant3);

        await databaseBuilder.commit();
      });

      it('orders results by last name ASC then first name ASC ', async () => {
        const { campaignAssessmentParticipationSummaries } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId: campaign.id });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.exactlyContainInOrder(['First', 'Second', 'Third']);
      });
    });

    context('pagination' , () => {

      beforeEach(async () => {
        campaign = databaseBuilder.factory.buildAssessmentCampaign({});

        const participation = {
          campaignId: campaign.id
        };

        databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});
        databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});

        await databaseBuilder.commit();
      });

      it('should return paginated campaign participations based on the given size and number', async () => {
        const page = { size: 1 , number: 1 };

        const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId:  campaign.id, page });
        const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

        expect(participantExternalIds).to.have.lengthOf(1);
        expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 1, rowCount: 2 });
      });

      context('default pagination', () => {
        beforeEach(async () => {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          const participation = {
            campaignId: campaign.id
          };

          for (let i = 0; i < 11; i++) {
            databaseBuilder.factory.buildAssessmentFromParticipation(participation, {});
          }

          await databaseBuilder.commit();
        });

        it('should return the first page with 10 elements', async () => {

          const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId:  campaign.id });
          const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(10);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 2, pageSize: 10, rowCount: 11 });

        });
      });

      context('when there are zero rows', () => {
        beforeEach(async () => {
          campaign = databaseBuilder.factory.buildAssessmentCampaign({});

          await databaseBuilder.commit();
        });

        it('should return the first page with 1 elements', async () => {

          const { campaignAssessmentParticipationSummaries, pagination } = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ campaignId:  campaign.id });
          const participantExternalIds = campaignAssessmentParticipationSummaries.map((summary) => summary.participantExternalId);

          expect(participantExternalIds).to.have.lengthOf(0);
          expect(pagination).to.deep.equals({ page: 1, pageCount: 0, pageSize: 10, rowCount: 0 });

        });
      });
    });
  });
});
