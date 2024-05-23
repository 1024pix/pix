import * as campaignParticipationsStatsRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participations-stats-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

const { STARTED, TO_SHARE, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participations Stats', function () {
  describe('#getParticipationsActivityByDate', function () {
    context('when there are no participations', function () {
      it('should return an empty array', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([]);
        expect(activityByDate.sharedParticipations).deep.equal([]);
      });
    });

    context('when there are participations', function () {
      it('should return the cumulative sum of participation for the campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-02' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-03' });
        databaseBuilder.factory.buildCampaignParticipation({ createdAt: '2021-01-01' });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([
          { day: '2021-01-02', count: 1 },
          { day: '2021-01-03', count: 2 },
        ]);
      });

      it('should return the cumulative sum of participation for the campaign while excluding dates with deleted participations', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-02' });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-03',
          deletedAt: '2021-01-03',
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-01-04' });
        databaseBuilder.factory.buildCampaignParticipation({ createdAt: '2021-01-01' });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([
          { day: '2021-01-02', count: 1 },
          { day: '2021-01-04', count: 2 },
        ]);
      });

      it('should return empty array when participation is deleted ', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-03',
          deletedAt: '2021-01-03',
        });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.startedParticipations).deep.equal([]);
      });

      it('should return the cumulative sum of shared participation for the campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-01',
          sharedAt: '2021-01-01',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-01',
          sharedAt: '2021-01-03',
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          createdAt: '2021-01-02',
          status: STARTED,
          sharedAt: null,
        });
        databaseBuilder.factory.buildCampaignParticipation({ createdAt: '2021-01-01', sharedAt: '2021-01-01' });
        await databaseBuilder.commit();

        const activityByDate = await campaignParticipationsStatsRepository.getParticipationsActivityByDate(campaignId);

        expect(activityByDate.sharedParticipations).deep.equal([
          { day: '2021-01-01', count: 1 },
          { day: '2021-01-03', count: 2 },
        ]);
      });
    });
  });

  describe('#countParticipationsByMasteryRate', function () {
    context('When there is no shared participation', function () {
      it('return an empty array', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED });

        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });

        expect(resultDistribution).to.be.empty;
      });
    });

    context('When there are shared participation', function () {
      it('returns the participation count by mastery rate', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.2 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([
          { count: 2, masteryRate: '0.10' },
          { count: 1, masteryRate: '0.20' },
        ]);
      });
    });

    context('When there are shared participation for other campaign', function () {
      it('returns only participation count for given campaign', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.2 });
        const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaignId, masteryRate: 0.2 });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([
          { count: 1, masteryRate: '0.10' },
          { count: 1, masteryRate: '0.20' },
        ]);
      });
    });

    context('When there are deleted participations', function () {
      it('counts only not deleted participations', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          masteryRate: 0.2,
          deletedAt: new Date('2021-05-29'),
        });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '0.10' }]);
      });
    });

    context('When there are participation without mastery rate', function () {
      it('returns only participation count for participation with mastery rate', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: null });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '0.10' }]);
      });
    });

    context('When there are participation not shared', function () {
      it('returns only shared participation', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED, masteryRate: 0.1 });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 1 });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '1.00' }]);
      });
    });

    context('When there are participants whith several participations', function () {
      it('counts the last participation for each participant', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, masteryRate: 0.5, isImproved: true });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId, masteryRate: 1, isImproved: false });

        await databaseBuilder.commit();
        const resultDistribution = await campaignParticipationsStatsRepository.countParticipationsByMasteryRate({
          campaignId,
        });
        expect(resultDistribution).to.exactlyContainInOrder([{ count: 1, masteryRate: '1.00' }]);
      });
    });
  });

  describe('#getAllParticipationsByCampaignId', function () {
    let campaignId;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    it('returns an empty object when no participations', async function () {
      await databaseBuilder.commit();

      const result = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([]);
    });

    it('returns the list of the campaign', async function () {
      databaseBuilder.factory.buildCampaignParticipation({ masteryRate: 0 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0, validatedSkillsCount: 0 });
      await databaseBuilder.commit();

      const result = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });

    it('returns the list of only isImproved=false participations', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        isImproved: false,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        isImproved: true,
      });
      await databaseBuilder.commit();

      const result = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });

    it('returns the list of not deleted participations', async function () {
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        deletedAt: null,
        validatedSkillsCount: 0,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0,
        validatedSkillsCount: 0,
        deletedAt: new Date('2019-03-13'),
      });
      await databaseBuilder.commit();

      const result = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

      expect(result).to.deep.equal([{ masteryRate: '0.00', validatedSkillsCount: 0 }]);
    });
  });

  describe('#countParticipationsByStatus', function () {
    describe('For assessment campaign', function () {
      let campaignId;
      let campaignType;

      beforeEach(async function () {
        const campaign = databaseBuilder.factory.buildCampaign();
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function () {
        await databaseBuilder.commit();

        const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
          campaignId,
          campaignType,
        );

        expect(result).to.deep.equal({ started: 0, completed: 0, shared: 0 });
      });

      it("should not count any participation regardless of it's status when participation is deleted ", async function () {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED, deletedAt: '2022-03-17' });
        await databaseBuilder.commit();

        const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
          campaignId,
          campaignType,
        );

        expect(result).to.deep.equal({ started: 0, completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function () {
        it('counts participations shared', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });

        it('counts the last participation shared by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 0, completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function () {
        it('counts participations completed', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: TO_SHARE });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });

        it('counts the last participations completed by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: TO_SHARE,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 0, completed: 1, shared: 0 });
        });
      });

      describe('Count started Participation', function () {
        it('counts participations started', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: STARTED });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });

        it('counts the last participation started by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
            isImproved: true,
          });
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            status: STARTED,
          });

          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ started: 1, completed: 0, shared: 0 });
        });
      });
    });

    describe('For profile collection campaign', function () {
      let campaignId;
      let campaignType;

      beforeEach(async function () {
        const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
        campaignId = campaign.id;
        campaignType = campaign.type;
        await databaseBuilder.commit();
      });

      it('returns a default object when no participations', async function () {
        await databaseBuilder.commit();

        const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
          campaignId,
          campaignType,
        );

        expect(result).to.deep.equal({ completed: 0, shared: 0 });
      });

      it("should not count any participation regardless of it's status when participation is deleted ", async function () {
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED, deletedAt: '2022-03-17' });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, deletedAt: '2022-03-17' });
        await databaseBuilder.commit();

        const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
          campaignId,
          campaignType,
        );

        expect(result).to.deep.equal({ completed: 0, shared: 0 });
      });

      describe('Count shared Participation', function () {
        it('counts participations shared', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: SHARED });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });

        it('counts the last participation shared by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ completed: 0, shared: 1 });
        });
      });

      describe('Count completed Participation', function () {
        it('counts participations completed', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ status: TO_SHARE });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });

        it('counts the last participation completed by user', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE, isImproved: true });
          databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: TO_SHARE });
          await databaseBuilder.commit();

          const result = await campaignParticipationsStatsRepository.countParticipationsByStatus(
            campaignId,
            campaignType,
          );

          expect(result).to.deep.equal({ completed: 1, shared: 0 });
        });
      });
    });
  });
});
