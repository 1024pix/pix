import _ from 'lodash';

import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { DomainTransaction, withTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/read-models/AvailableCampaignParticipation.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { ApplicationTransaction } from '../../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { catchErr, databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

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

        await withTransaction(async () => campaignParticipationRepository.updateWithSnapshot(campaignParticipation))();

        const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
        expect(snapshotInDB).to.have.length(1);
      });

      it('does not save a snapshot when there is an error', async function () {
        campaignParticipation.sharedAt = new Date();

        try {
          await withTransaction(async () => {
            await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
            throw new Error();
          })();
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

  describe('#getByCampaignIds', function () {
    it('should return participations', async function () {
      // given
      const firstCampaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        deletedAt: null,
        deletedBy: null,
      });
      const secondCampaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        deletedAt: null,
        deletedBy: null,
      });
      databaseBuilder.factory.buildCampaignParticipation();
      await databaseBuilder.commit();

      // when
      const participations = await campaignParticipationRepository.getByCampaignIds([
        firstCampaignParticipationToUpdate.campaignId,
        secondCampaignParticipationToUpdate.campaignId,
      ]);

      // then
      expect(participations).to.be.deep.equal([
        new CampaignParticipation(firstCampaignParticipationToUpdate),
        new CampaignParticipation(secondCampaignParticipationToUpdate),
      ]);
    });

    it('should not return deleted participations', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
        deletedAt: new Date(),
        deletedBy: userId,
      });
      await databaseBuilder.commit();

      // when
      const participations = await campaignParticipationRepository.getByCampaignIds([deletedParticipation.campaignId]);

      // then
      expect(participations.length).to.equal(0);
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

    it('should not update because the learner can not have 2 active participations for the same campaign', async function () {
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

  describe('#batchUpdate', function () {
    let clock;
    const frozenTime = new Date('1987-09-01T00:00:00Z');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: frozenTime, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('save the changes of multiple campaignParticipations', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const firstCampaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        deletedAt: null,
        deletedBy: null,
      });
      const secondCampaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        deletedAt: null,
        deletedBy: null,
      });

      await databaseBuilder.commit();

      // when
      const participations = [
        new CampaignParticipation(firstCampaignParticipationToUpdate),
        new CampaignParticipation(secondCampaignParticipationToUpdate),
      ];
      participations.forEach((participation) => {
        participation.delete(user.id);
      });
      await campaignParticipationRepository.batchUpdate(participations);

      // then
      const updatedFirstParticipation = await campaignParticipationRepository.get(
        firstCampaignParticipationToUpdate.id,
      );
      const updatedSecondParticipation = await campaignParticipationRepository.get(
        secondCampaignParticipationToUpdate.id,
      );
      expect(updatedFirstParticipation).to.deep.include({
        deletedAt: frozenTime,
        deletedBy: user.id,
      });
      expect(updatedSecondParticipation).to.deep.include({
        deletedAt: frozenTime,
        deletedBy: user.id,
      });
    });
  });

  describe('#getAllCampaignParticipationsInCampaignForASameLearner', function () {
    let campaignId;
    let organizationLearnerId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
    });

    context('When the participation is not from the given campaignId', function () {
      it('should return an error 400', async function () {
        const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: false,
        });

        await databaseBuilder.commit();

        const error = await catchErr(async function () {
          await DomainTransaction.execute(async (domainTransaction) => {
            await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
              campaignId,
              campaignParticipationId: campaignParticipationToDelete.id,
              domainTransaction,
            });
          });
        })();
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('When the participant only has participations for the same campaign', function () {
      it('should return all participations for the given campaign', async function () {
        const campaignParticipationImproved = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: true,
        });
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          status: SHARED,
          isImproved: false,
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations[0]).to.be.instanceOf(CampaignParticipation);
        expect(participations[1]).to.be.instanceOf(CampaignParticipation);
        expect(participations.map((participation) => participation.id)).to.have.members([
          campaignParticipationImproved.id,
          campaignParticipationToDelete.id,
        ]);
      });
    });

    describe('#delete', function () {
      it('should update the campaign-participations with deletedAt and deletedBy attributes', async function () {
        const ownerId = databaseBuilder.factory.buildUser().id;
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ ownerId });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        campaignParticipation.deletedAt = new Date('2022-11-01T23:00:00Z');
        campaignParticipation.deletedBy = ownerId;

        await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.remove({
            id: campaignParticipation.id,
            deletedAt: campaignParticipation.deletedAt,
            deletedBy: campaignParticipation.deletedBy,
            domainTransaction,
          });
        });

        const deletedCampaignParticipation = await knex('campaign-participations').first();

        expect(deletedCampaignParticipation.deletedAt).to.deep.equal(new Date('2022-11-01T23:00:00Z'));
        expect(deletedCampaignParticipation.deletedBy).to.deep.equal(ownerId);
      });
    });

    context('When the participant has deleted participations for the same campaigns', function () {
      it('should return only participations which are not deleted', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          deletedBy: userId,
          deletedAt: new Date('2021-06-07'),
        });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations.map((participation) => participation.id)).to.deep.equal([
          campaignParticipationToDelete.id,
        ]);
      });
    });

    context('When the participant has participations for differents campaigns', function () {
      it('should return only participations for the given campaign', async function () {
        const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId: otherOrganizationLearnerId,
          campaignId,
        });

        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          campaignId: otherCampaignId,
        });

        await databaseBuilder.commit();

        const participations = await DomainTransaction.execute((domainTransaction) => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
            domainTransaction,
          });
        });

        expect(participations.map((participation) => participation.id)).to.deep.equal([
          campaignParticipationToDelete.id,
        ]);
      });
    });
  });

  describe('#getCampaignParticipationsForOrganizationLearner', function () {
    let campaignId;
    let organizationLearnerId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
    });

    context('should return empty participations', function () {
      it('When campaign participation are deleted', async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          organizationLearnerId,
          deletedAt: new Date('2022-05-01'),
        });
        // add a particpation from another user
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        const participations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
          campaignId,
          organizationLearnerId,
        });

        expect(participations).lengthOf(0);
      });

      it('If no participation found', async function () {
        // add a particpation from another user
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        const participations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
          campaignId,
          organizationLearnerId,
        });

        expect(participations).to.lengthOf(0);
      });
    });

    it('should return by descendant ordered all participations for the given campaign', async function () {
      const campaignParticipationImproved1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        createdAt: new Date('2022-05-01'),
        status: SHARED,
        isImproved: true,
      });
      const campaignParticipationImproved2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        status: SHARED,
        createdAt: new Date('2023-05-01'),
        isImproved: true,
      });
      const lastCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        status: SHARED,
        createdAt: new Date('2024-05-01'),
        isImproved: false,
      });
      // add a particpation from another user
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      const participations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
        campaignId,
        organizationLearnerId,
      });

      expect(participations.map((participation) => participation.id)).to.have.deep.equals([
        lastCampaignParticipation.id,
        campaignParticipationImproved2.id,
        campaignParticipationImproved1.id,
      ]);
    });

    it('should return AvailableCampaignParticipation objects', async function () {
      const lastCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
        status: SHARED,
        isImproved: false,
      });

      await databaseBuilder.commit();

      const participations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
        campaignId,
        organizationLearnerId,
      });

      expect(participations[0]).instanceOf(AvailableCampaignParticipation);
      expect(participations[0]).to.deep.equal({
        id: lastCampaignParticipation.id,
        sharedAt: lastCampaignParticipation.sharedAt,
        status: 'SHARED',
      });
    });
  });

  describe('#findProfilesCollectionResultDataByCampaignId', function () {
    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaign1 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });
      campaign2 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId, firstName: 'Hubert', lastName: 'Parterre', division: '6emeD' },
        {
          campaignId: campaign1.id,
          createdAt: new Date('2017-03-15T14:59:35Z'),
        },
      );
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
      });
      await databaseBuilder.commit();
    });

    it('should return the campaign-participation linked to the given campaign', async function () {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId']),
      );
      expect(attributes).to.deep.equal([
        {
          id: campaignParticipation1.id,
          isShared: true,
          sharedAt: campaignParticipation1.sharedAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
        },
      ]);
    });

    it('should not return the deleted campaign-participation linked to the given campaign', async function () {
      // given
      const campaignId = campaign1.id;
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId, firstName: 'Piere', lastName: 'Pi air', division: '6emeD' },
        {
          campaignId: campaign1.id,
          createdAt: new Date('2017-03-15T14:59:35Z'),
          deletedAt: new Date(),
        },
      );
      await databaseBuilder.commit();

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['id', 'isShared', 'sharedAt', 'participantExternalId', 'userId']),
      );
      expect(attributes).to.deep.equal([
        {
          id: campaignParticipation1.id,
          isShared: true,
          sharedAt: campaignParticipation1.sharedAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
        },
      ]);
    });

    it('should return the campaign participation with firstName and lastName from the organization learner', async function () {
      // given
      const campaignId = campaign1.id;

      // when
      const participationResultDatas =
        await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

      // then
      const attributes = participationResultDatas.map((participationResultData) =>
        _.pick(participationResultData, ['participantFirstName', 'participantLastName', 'division']),
      );
      expect(attributes).to.deep.equal([
        {
          participantFirstName: 'Hubert',
          participantLastName: 'Parterre',
          division: '6emeD',
        },
      ]);
    });

    context('when a participant has several organization-learners for different organizations', function () {
      let campaign;
      let otherCampaign;

      beforeEach(async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        otherCampaign = databaseBuilder.factory.buildCampaign({ organizationId });
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          division: '3eme',
        }).id;
        const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          division: '2nd',
        }).id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id, organizationLearnerId });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          organizationLearnerId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaign.id,
          organizationLearnerId: otherOrganizationLearnerId,
        });

        await databaseBuilder.commit();
      });

      it('should return the division of the school registration linked to the campaign', async function () {
        const campaignParticipationInfos =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        expect(campaignParticipationInfos.length).to.equal(1);
        expect(campaignParticipationInfos[0].division).to.equal('3eme');
      });
    });

    context('When the participant has improved its participation', function () {
      it('should return all campaign-participation', async function () {
        // given
        const campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          multipleSendings: true,
        }).id;

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          createdAt: new Date('2016-01-15T14:50:35Z'),
          isImproved: true,
        });
        const improvedCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          createdAt: new Date('2016-07-15T14:59:35Z'),
          isImproved: false,
        });
        await databaseBuilder.commit();

        // when
        const participationResultDatas =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaignId);

        // then
        expect(participationResultDatas).to.lengthOf(2);
        expect(participationResultDatas[0].id).to.eq(improvedCampaignParticipation.id);
        expect(participationResultDatas[1].id).to.eq(campaignParticipation.id);
      });
    });

    context('When sharedAt is null', function () {
      it('Should return null as shared date', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          status: STARTED,
          sharedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const participationResultDatas =
          await campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id);

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
    });
  });
});
