import { sinon, expect, knex, databaseBuilder, catchErr } from '../../../../../test-helper.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { ApplicationTransaction } from '../../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation', function () {
  describe('#updateWithSnapshot', function () {
    let clock;
    let campaignParticipation;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async function () {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        status: STARTED,
        sharedAt: null,
      });

      databaseBuilder.factory.buildKnowledgeElement({
        userId: campaignParticipation.userId,
        createdAt: new Date('1985-09-01T00:00:00Z'),
      });
      clock = sinon.useFakeTimers({ now: frozenTime, toFake: ['Date'] });

      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('persists the campaign-participation changes', async function () {
      // given
      campaignParticipation.campaign = {};
      campaignParticipation.assessments = [];
      campaignParticipation.user = {};
      campaignParticipation.assessmentId = {};
      campaignParticipation.isShared = true;
      campaignParticipation.sharedAt = new Date('2020-01-02');
      campaignParticipation.status = SHARED;
      campaignParticipation.participantExternalId = 'Laura';

      // when
      await ApplicationTransaction.execute(async () => {
        await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
      });

      const updatedCampaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipation.id })
        .first();
      // then
      expect(updatedCampaignParticipation.status).to.equals(SHARED);
      expect(updatedCampaignParticipation.participantExternalId).to.equals('Laura');
    });

    it('should save a snapshot', async function () {
      // given
      campaignParticipation.sharedAt = new Date();

      // when
      await ApplicationTransaction.execute(async () => {
        await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
      });

      // then
      const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
      expect(snapshotInDB).to.have.length(1);
    });

    context('when there is a transaction', function () {
      it('should save a snapshot using a transaction', async function () {
        campaignParticipation.sharedAt = new Date();

        await ApplicationTransaction.execute(async () => {
          await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
        });

        const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
        expect(snapshotInDB).to.have.length(1);
      });

      it('does not save a snapshot when there is an error', async function () {
        campaignParticipation.sharedAt = new Date();

        try {
          await ApplicationTransaction.execute(async () => {
            await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
            throw new Error();
          });
          // eslint-disable-next-line no-empty
        } catch (error) {}

        const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
        const participations = await knex.select('sharedAt').from('campaign-participations');
        expect(participations.sharedAt).to.be.undefined;
        expect(snapshotInDB).to.be.empty;
      });
    });
  });

  describe('#get', function () {
    let campaignId;
    let campaignParticipationId, campaignParticipationNotSharedId;
    let campaignParticipationAssessments;
    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        validatedSkillsCount: 12,
      }).id;
      campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: STARTED,
        sharedAt: null,
      }).id;

      const assessment1 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-01-01T10:00:00Z'),
      });

      const assessment2 = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId,
        createdAt: new Date('2000-03-01T10:00:00Z'),
      });

      databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId: campaignParticipationNotSharedId,
        createdAt: new Date('2000-02-01T10:00:00Z'),
      });

      campaignParticipationAssessments = [assessment1, assessment2];

      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
      });

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationNotSharedId, domainTransaction);
      });

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('returns the assessments of campaignParticipation', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
      });

      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });

    it('returns the campaign of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
      });

      // then
      expect(foundCampaignParticipation.campaign.id).to.equal(campaignId);
    });

    it('returns the assessments of campaignParticipation using the transaction', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute((domainTransaction) => {
        return campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
      });

      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });
  });

  describe('#update', function () {
    it('save the changes of the campaignParticipation', async function () {
      const campaignParticipationId = 12;
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        id: campaignParticipationId,
        status: STARTED,
        sharedAt: null,
      });

      await databaseBuilder.commit();

      await DomainTransaction.execute(async (domainTransaction) => {
        await campaignParticipationRepository.update(
          {
            ...campaignParticipationToUpdate,
            sharedAt: new Date('2021-01-01'),
            status: SHARED,
          },
          domainTransaction,
        );
      });

      const campaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipationId })
        .first();

      expect(campaignParticipation.sharedAt).to.deep.equals(new Date('2021-01-01'));
      expect(campaignParticipation.status).to.equals(SHARED);
    });

    it('should not update because the leaner can not have 2 active participations for the same campaign', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ organizationLearnerId, campaignId });
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
      });

      await databaseBuilder.commit();

      const error = await DomainTransaction.execute(async (domainTransaction) => {
        return catchErr(campaignParticipationRepository.update)(
          {
            ...campaignParticipationToUpdate,
            campaignId,
          },
          domainTransaction,
        );
      });

      expect(error.constraint).to.equals('one_active_participation_by_learner');
    });
  });
});
