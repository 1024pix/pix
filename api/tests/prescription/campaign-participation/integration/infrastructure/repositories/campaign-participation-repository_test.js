import _ from 'lodash';

import * as knowledgeElementSnapshotAPI from '../../../../../../src/prescription/campaign/application/api/knowledge-element-snapshots-api.js';
import { CampaignParticipationInfo } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipationInfo.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/read-models/AvailableCampaignParticipation.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { constants } from '../../../../../../src/shared/domain/constants.js';
import { DomainTransaction, withTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation', function () {
  describe('#updateWithSnapshot', function () {
    context('when campaign is of type ASSESSMENT', function () {
      let clock;
      let campaignParticipation;
      let ke;
      const frozenTime = new Date('1987-09-01T00:00:00Z');

      beforeEach(async function () {
        const campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
        }).id;
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          status: STARTED,
          sharedAt: null,
        });

        ke = databaseBuilder.factory.buildKnowledgeElement({
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
        await DomainTransaction.execute(async () => {
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
        await DomainTransaction.execute(async () => {
          await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
        });

        // then
        const snapshotInDB = await knex.pluck('snapshot').from('knowledge-element-snapshots');
        expect(snapshotInDB).to.have.lengthOf(1);
        expect(snapshotInDB).to.deep.equal([
          [
            {
              competenceId: ke.competenceId,
              createdAt: ke.createdAt.toISOString(),
              earnedPix: 2,
              skillId: ke.skillId,
              source: ke.source,
              status: ke.status,
            },
          ],
        ]);
      });

      context('when there is a transaction', function () {
        it('should save a snapshot using a transaction', async function () {
          campaignParticipation.sharedAt = new Date();

          await withTransaction(async () =>
            campaignParticipationRepository.updateWithSnapshot(campaignParticipation),
          )();

          const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
          expect(snapshotInDB).to.have.lengthOf(1);
        });

        it('does not save a snapshot when there is an error', async function () {
          campaignParticipation.sharedAt = new Date();

          try {
            await withTransaction(async () => {
              await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);
              throw new Error();
            })();
            // eslint-disable-next-line no-empty
          } catch {}

          const snapshotInDB = await knex.select('id').from('knowledge-element-snapshots');
          const participations = await knex.select('sharedAt').from('campaign-participations');
          expect(participations.sharedAt).to.be.undefined;
          expect(snapshotInDB).to.be.empty;
        });
      });
    });

    context('when campaign is of type EXAM', function () {
      let campaignParticipation;

      beforeEach(async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.EXAM,
        }).id;
        campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          status: STARTED,
          sharedAt: null,
        });
        const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
          skillId: 'acquis1',
        });
        const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
          userId,
          createdAt: new Date('2019-03-01'),
          skillId: 'acquis2',
        });
        const knowledgeElementsBefore = new KnowledgeElementCollection([knowledgeElement1, knowledgeElement2]);
        databaseBuilder.factory.buildKnowledgeElementSnapshot({
          campaignParticipationId: campaignParticipation.id,
          snapshot: knowledgeElementsBefore.toSnapshot(),
        });
        await databaseBuilder.commit();
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
        await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

        // then
        const updatedCampaignParticipation = await knex('campaign-participations')
          .where({ id: campaignParticipation.id })
          .first();
        expect(updatedCampaignParticipation.status).to.equals(SHARED);
        expect(updatedCampaignParticipation.participantExternalId).to.equals('Laura');
      });

      it('should left existing snapshot untouched', async function () {
        // given
        campaignParticipation.sharedAt = new Date();
        const snapshotBefore = await knowledgeElementSnapshotAPI.getByParticipation(campaignParticipation.id);

        // when
        await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

        // then
        const snapshotAfter = await knowledgeElementSnapshotAPI.getByParticipation(campaignParticipation.id);
        expect(snapshotBefore).to.deepEqualInstance(snapshotAfter);
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
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.get(campaignParticipationId);
      });

      // then
      expect(foundCampaignParticipation.id).to.equal(campaignParticipationId);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('should return a null object for sharedAt when the campaign-participation is not shared', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.get(campaignParticipationNotSharedId);
      });

      // then
      expect(foundCampaignParticipation.sharedAt).to.be.null;
    });

    it('returns the assessments of campaignParticipation', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.get(campaignParticipationId);
      });

      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });

    it('returns the campaign of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.get(campaignParticipationId);
      });

      // then
      expect(foundCampaignParticipation.campaign.id).to.equal(campaignId);
    });

    it('returns the assessments of campaignParticipation using the transaction', async function () {
      //given
      const expectedAssessmentIds = campaignParticipationAssessments.map(({ id }) => id);

      // when
      const foundCampaignParticipation = await DomainTransaction.execute(() => {
        return campaignParticipationRepository.get(campaignParticipationId);
      });

      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain(expectedAssessmentIds);
    });
  });

  describe('#getLocked', function () {
    let campaignId;
    let assessment;
    let participation;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({}).id;
      participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        validatedSkillsCount: 12,
      });
      assessment = databaseBuilder.factory.buildAssessment({
        type: 'CAMPAIGN',
        campaignParticipationId: participation.id,
        createdAt: new Date('2000-01-01T10:00:00Z'),
      });
      await databaseBuilder.commit();
    });

    it('should return a campaign participation object', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.getLocked(participation.id);
      });

      // then
      expect(foundCampaignParticipation.id).to.equal(participation.id);
      expect(foundCampaignParticipation.validatedSkillsCount).to.equal(12);
    });

    it('returns the campaign of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.getLocked(participation.id);
      });

      // then
      expect(foundCampaignParticipation.campaign.id).to.equal(campaignId);
    });

    it('returns the assessments of campaignParticipation', async function () {
      // when
      const foundCampaignParticipation = await DomainTransaction.execute(async () => {
        return campaignParticipationRepository.getLocked(participation.id);
      });

      const assessmentIds = foundCampaignParticipation.assessments.map(({ id }) => id);

      // then
      expect(assessmentIds).to.exactlyContain([assessment.id]);
    });

    it('should lock table for update', async function () {
      const error = await catchErr(DomainTransaction.execute)(async () => {
        await campaignParticipationRepository.getLocked(participation.id);
        // we mimick a concurrent call on the campaign-participations table on the same row
        return knex('campaign-participations').where({ id: participation.id }).first().forUpdate().timeout(100);
      });
      expect(error).instanceOf(Error);
      expect(error.message).to.equal('Defined query timeout of 100ms exceeded when running query.');
    });

    it('should not lock table for update', async function () {
      const campaignParticipationNotSharedId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: STARTED,
        sharedAt: null,
      }).id;
      await databaseBuilder.commit();

      const notLockedParticipation = await DomainTransaction.execute(async () => {
        campaignParticipationRepository.getLocked(participation.id);
        // we mimick a concurrent call on the campaign-participations table on another row
        return knex('campaign-participations')
          .where({ id: campaignParticipationNotSharedId })
          .first()
          .forUpdate()
          .timeout(100);
      });
      expect(notLockedParticipation.id).to.equal(campaignParticipationNotSharedId);
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
      expect(participations).to.have.lengthOf(0);
    });
  });

  describe('#getCampaignParticipationsCountByUserId', function () {
    it('should return participations number', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId,
      });
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: otherUserId,
      });
      await databaseBuilder.commit();

      // when
      const participations = await campaignParticipationRepository.getCampaignParticipationsCountByUserId({ userId });

      // then
      expect(participations).to.equal(2);
    });

    it('returns 0', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({
        userId: otherUserId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.getCampaignParticipationsCountByUserId({ userId });

      // then
      expect(result).to.equal(0);
    });
  });

  describe('#update', function () {
    it('save the changes of the campaignParticipation', async function () {
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        status: STARTED,
        sharedAt: null,
      });

      await databaseBuilder.commit();

      await DomainTransaction.execute(async () => {
        await campaignParticipationRepository.update({
          ...campaignParticipationToUpdate,
          sharedAt: new Date('2021-01-01'),
          status: SHARED,
        });
      });

      const campaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipationToUpdate.id })
        .first();

      expect(campaignParticipation.sharedAt).to.deep.equals(new Date('2021-01-01'));
      expect(campaignParticipation.status).to.equals(SHARED);
    });

    it('should not update campaignId', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipationToUpdate = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        status: STARTED,
        sharedAt: null,
      });

      await databaseBuilder.commit();
      const participation = new CampaignParticipation(campaignParticipationToUpdate);

      await DomainTransaction.execute(async () => {
        await campaignParticipationRepository.update(participation);
      });

      const campaignParticipation = await knex('campaign-participations')
        .where({ id: campaignParticipationToUpdate.id })
        .first();

      expect(campaignParticipation.campaignId).to.equal(campaignId);
    });
  });

  describe('#remove', function () {
    it('should mark as deleted given participation', async function () {
      const ownerId = databaseBuilder.factory.buildUser().id;
      const participantUserId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ ownerId });
      const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign({ ownerId });

      const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        deletedAt: null,
        deletedBy: null,
        userId: participantUserId,
        participantExternalId: 'ollalalalal',
      });
      const campaignParticipationStillActive = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
        deletedAt: null,
        deletedBy: null,
        userId: participantUserId,
        participantExternalId: 'ollalalalal',
      });

      await databaseBuilder.commit();

      const deletedAt = new Date('2022-11-01T23:00:00Z');

      await campaignParticipationRepository.remove({
        id: campaignParticipationToDelete.id,
        attributes: {
          deletedAt,
          deletedBy: ownerId,
        },
      });

      const deletedCampaignParticipation = await knex('campaign-participations').whereNotNull('deletedAt').first();

      expect(deletedCampaignParticipation.id).to.be.equal(campaignParticipationToDelete.id);

      const activeCampaignParticipation = await knex('campaign-participations').whereNull('deletedAt').first();

      expect(activeCampaignParticipation.id).to.be.equal(campaignParticipationStillActive.id);
    });

    it('should update the campaign-participations with deletedAt and deletedBy attributes', async function () {
      const ownerId = databaseBuilder.factory.buildUser().id;
      const participantUserId = databaseBuilder.factory.buildUser().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ ownerId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        deletedAt: null,
        deletedBy: null,
        userId: participantUserId,
        participantExternalId: 'ollalalalal',
      });

      await databaseBuilder.commit();

      const deletedAt = new Date('2022-11-01T23:00:00Z');

      await campaignParticipationRepository.remove({
        id: campaignParticipation.id,
        attributes: {
          participantExternalId: null,
          userId: null,
          deletedAt,
          deletedBy: ownerId,
        },
      });

      const deletedCampaignParticipation = await knex('campaign-participations').first();

      expect(deletedCampaignParticipation.participantExternalId).to.be.null;
      expect(deletedCampaignParticipation.userId).to.be.null;
      expect(deletedCampaignParticipation.deletedAt).to.deep.equal(new Date('2022-11-01T23:00:00Z'));
      expect(deletedCampaignParticipation.deletedBy).to.deep.equal(ownerId);
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
          await DomainTransaction.execute(async () => {
            await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
              campaignId,
              campaignParticipationId: campaignParticipationToDelete.id,
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

        const participations = await DomainTransaction.execute(() => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
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

        const participations = await DomainTransaction.execute(() => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
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

        const participations = await DomainTransaction.execute(() => {
          return campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
            campaignId,
            campaignParticipationId: campaignParticipationToDelete.id,
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
      // add a participation from another user
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

  describe('#getAllCampaignParticipationsForOrganizationLearner', function () {
    let organizationLearnerId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
    });

    context('should return empty participations', function () {
      it('When campaign participation are deleted', async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          organizationLearnerId,
          deletedAt: new Date('2022-05-01'),
        });
        // add a participation from another user
        databaseBuilder.factory.buildCampaignParticipation();

        await databaseBuilder.commit();

        const participations = await campaignParticipationRepository.getAllCampaignParticipationsForOrganizationLearner(
          {
            organizationLearnerId,
          },
        );

        expect(participations).lengthOf(0);
      });

      it('If no participation found', async function () {
        // add a participation from another user
        databaseBuilder.factory.buildCampaignParticipation();

        await databaseBuilder.commit();

        const participations = await campaignParticipationRepository.getAllCampaignParticipationsForOrganizationLearner(
          {
            organizationLearnerId,
          },
        );

        expect(participations).to.lengthOf(0);
      });
    });

    it('should return CampaignParticipation objects', async function () {
      const lastCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        status: SHARED,
        isImproved: false,
      });

      await databaseBuilder.commit();

      const participations = await campaignParticipationRepository.getAllCampaignParticipationsForOrganizationLearner({
        organizationLearnerId,
      });

      expect(participations[0]).instanceOf(CampaignParticipation);
      const { id, sharedAt, status } = participations[0];
      expect({ id, sharedAt, status }).to.deep.equal({
        id: lastCampaignParticipation.id,
        sharedAt: lastCampaignParticipation.sharedAt,
        status: SHARED,
      });
    });
  });

  describe('#findInfoByCampaignId', function () {
    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let organizationLearner1;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaign1 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });
      campaign2 = databaseBuilder.factory.buildCampaign({ organizationId, type: CampaignTypes.PROFILES_COLLECTION });
      organizationLearner1 = {
        organizationId,
        firstName: 'Hubert',
        lastName: 'Parterre',
        division: '6emeD',
        group: null,
        attributes: { hobby: 'Genky' },
        studentNumber: '1002',
      };
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        organizationLearner1,
        {
          campaignId: campaign1.id,
          createdAt: new Date('2017-03-15T14:59:35Z'),
          sharedAt: new Date('2017-03-16T14:59:35Z'),
          validatedSkillsCount: 10,
          pixScore: 10,
          masteryRate: null,
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
      const { models: participationResultDatas } =
        await campaignParticipationRepository.findInfoByCampaignId(campaignId);

      // then
      expect(participationResultDatas).lengthOf(1);
      expect(participationResultDatas[0]).to.be.instanceOf(CampaignParticipationInfo);
      expect(participationResultDatas[0]).to.deep.equal({
        isCompleted: false,
        sharedAt: campaignParticipation1.sharedAt,
        participantExternalId: campaignParticipation1.participantExternalId,
        userId: campaignParticipation1.userId,
        participantFirstName: organizationLearner1.firstName,
        participantLastName: organizationLearner1.lastName,
        division: organizationLearner1.division,
        additionalInfos: organizationLearner1.attributes,
        status: campaignParticipation1.status,
        pixScore: campaignParticipation1.pixScore,
        validatedSkillsCount: campaignParticipation1.validatedSkillsCount,
        createdAt: campaignParticipation1.createdAt,
        studentNumber: organizationLearner1.studentNumber,
        campaignParticipationId: campaignParticipation1.id,
        masteryRate: campaignParticipation1.masteryRate,
        group: organizationLearner1.group,
      });
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
      const { models: participationResultDatas } =
        await campaignParticipationRepository.findInfoByCampaignId(campaignId);

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
      const { models: participationResultDatas } =
        await campaignParticipationRepository.findInfoByCampaignId(campaignId);

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
        const { models: campaignParticipationInfos } = await campaignParticipationRepository.findInfoByCampaignId(
          campaign.id,
        );

        expect(campaignParticipationInfos).to.have.lengthOf(1);
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
        const { models: participationResultDatas } =
          await campaignParticipationRepository.findInfoByCampaignId(campaignId);

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
        const { models: participationResultDatas } = await campaignParticipationRepository.findInfoByCampaignId(
          campaign.id,
        );

        // then
        expect(participationResultDatas[0].sharedAt).to.equal(null);
      });
    });

    context('pagination', function () {
      it('should use given page and return pagination metadata', async function () {
        // given
        const campaignId = campaign1.id;
        const page = { number: 2, size: 10 };

        // when
        const { models: participationResultDatas, meta } = await campaignParticipationRepository.findInfoByCampaignId(
          campaignId,
          page,
        );

        // then
        expect(participationResultDatas).lengthOf(0);
        expect(meta).to.deep.equal({
          page: 2,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        });
      });
    });
  });

  describe('#findOneByCampaignIdAndUserId', function () {
    let userId;
    let campaignId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;

      campaignId = databaseBuilder.factory.buildCampaign().id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: otherUserId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
        userId,
      });
      await databaseBuilder.commit();
    });

    it('should return the campaign participation found', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.be.instanceOf(CampaignParticipation);
      expect(response.id).to.equal(campaignParticipation.id);
    });

    it('should return the non improved campaign participation found', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        isImproved: true,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });

      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.be.instanceOf(CampaignParticipation);
      expect(response.id).to.equal(campaignParticipation.id);
    });

    it('should include assessments found too', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });
      const assessment = databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation.id });
      await databaseBuilder.commit();

      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response.assessments).to.have.lengthOf(1);
      expect(response.assessments[0]).to.be.instanceOf(Assessment);
      expect(response.assessments[0].id).to.equal(assessment.id);
    });

    it('should return no campaign participation', async function () {
      // when
      const response = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });

      // then
      expect(response).to.equal(null);
    });
  });

  describe('#hasAssessmentParticipations', function () {
    let userId;

    beforeEach(async function () {
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return true if the user has participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
        createdAt: participation.createdAt,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(true);
    });

    it('should return true if the user has participations to campaigns of type exam', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
        createdAt: participation.createdAt,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the user does not have participations', async function () {
      // given
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: otherUser.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        createdAt: participation.createdAt,
        userId: otherUser.id,
        type: Assessment.types.CAMPAIGN,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return false if the user does not have participations to campaigns of type assement', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return false if the user only have autonomouse-course participations', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      });
      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        type: CampaignTypes.ASSESSMENT,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(false);
    });

    it('should return true if the user has only anonymised participations', async function () {
      // given
      databaseBuilder.factory.campaignParticipationOverviewFactory.buildDeletedAndAnonymised({
        userId,
        createdAt: new Date('2020-02-19'),
        assessmentCreatedAt: new Date('2020-02-19'),
        campaignSkills: [],
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignParticipationRepository.hasAssessmentParticipations(userId);

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#getCodeOfLastParticipationToProfilesCollectionCampaignForUser', function () {
    let userId;
    const expectedCode = 'GOOD';

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should return null if there is no participations', async function () {
      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations to share', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: SHARED,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if participations are deleted', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        deletedAt: new Date(),
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no campaigns of type profiles collection', async function () {
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if there is no participations for the user', async function () {
      const otherUser = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId: otherUser.id,
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return null if campaign is archived', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', archivedAt: new Date() });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(null);
    });

    it('should return code of the last participation to a campaign of type PROFILES_COLLECTION for the user', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: expectedCode });
      const otherCampaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'BAD' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaign.id,
        status: TO_SHARE,
        createdAt: new Date(Date.parse('11/11/2011')),
        userId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: TO_SHARE,
        userId,
        createdAt: new Date(Date.parse('12/11/2011')),
      });
      await databaseBuilder.commit();

      // when
      const code =
        await campaignParticipationRepository.getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId);

      // then
      expect(code).to.equal(expectedCode);
    });
  });

  describe('#isRetrying', function () {
    let campaignId;
    let campaignParticipationId;
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();
    });

    context('When the user has just one participation shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has just one participation not shared', function () {
      beforeEach(async function () {
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but all shared', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: new Date('2002-10-10'),
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user has several participations but not in the same campaign', function () {
      beforeEach(async function () {
        const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: otherCampaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When there is several participations but not for the same user', function () {
      beforeEach(async function () {
        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: otherUserId,
          isImproved: false,
          sharedAt: null,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns false', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.false;
      });
    });

    context('When the user is retrying the campaign', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: true,
          sharedAt: new Date('2002-10-10'),
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          isImproved: false,
          sharedAt: null,
        }).id;
        await databaseBuilder.commit();
      });

      it('returns true', async function () {
        const result = await campaignParticipationRepository.isRetrying({ userId, campaignParticipationId });
        expect(result).to.be.true;
      });
    });
  });

  describe('#getSharedParticipationIds', function () {
    context('no shared participation', function () {
      it('should return an empty array', async function () {
        // given
        const participation = databaseBuilder.factory.buildCampaignParticipation({
          status: CampaignParticipationStatuses.TO_SHARE,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: participation.campaignId,
          status: CampaignParticipationStatuses.STARTED,
        });
        await databaseBuilder.commit();
        // given
        // when
        const result = await campaignParticipationRepository.getSharedParticipationIds(participation.campaignId);

        // then
        expect(result).to.be.empty;
      });
    });
    context('with participation in another campaign', function () {
      it('should return an empty array', async function () {
        // given
        const campaign1 = databaseBuilder.factory.buildCampaign();
        const campaign2 = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign1.id,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();
        // given
        // when
        const result = await campaignParticipationRepository.getSharedParticipationIds(campaign2.id);

        // then
        expect(result).to.be.empty;
      });
    });
    context('with improved shared participation', function () {
      it('should return only not improved participation ', async function () {
        // given
        const improvedParticipation = databaseBuilder.factory.buildCampaignParticipation({
          status: CampaignParticipationStatuses.SHARED,
          isImproved: true,
        });
        const participation = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: improvedParticipation.campaignId,
          status: CampaignParticipationStatuses.SHARED,
          userId: improvedParticipation.userId,
          organizationLearnerId: improvedParticipation.organizationLearnerId,
        });
        await databaseBuilder.commit();
        // when
        const result = await campaignParticipationRepository.getSharedParticipationIds(participation.campaignId);

        // then
        expect(result).lengthOf(1);
        expect(result[0]).equal(participation.id);
      });
    });
  });
});
