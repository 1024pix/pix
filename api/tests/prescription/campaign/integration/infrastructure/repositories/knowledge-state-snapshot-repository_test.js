import * as knowledgeStateSnapshotRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { toLegacySnapshot } from '../../../../../tooling/knowledge-state/legacy-snapshot.js';

describe('Integration | Repository | KnowledgeStateSnapshotRepository', function () {
  // L'instantané se relit contre le référentiel : il doit être en place.
  beforeEach(async function () {
    ['acquis1', 'acquis2', 'acquis3'].forEach((skillId, index) =>
      databaseBuilder.factory.learningContent.buildSkill({
        id: skillId,
        name: `@tube${skillId}${index + 1}`,
        level: index + 1,
        tubeId: `tube-${skillId}`,
        competenceId: 'recCompetenceSnapshot',
        status: 'actif',
        pixValue: 2,
      }),
    );
    await databaseBuilder.commit();
  });

  const stateOf = (...skillLevels) =>
    KnowledgeState.fromRows(
      skillLevels.map(([skillId, level]) => ({
        tubeId: `tube-${skillId}`,
        floor: level,
        ceiling: null,
        directLevels: [level],
        updatedAt: new Date('2020-01-01'),
      })),
    );

  describe('#save', function () {
    it('should create a new snapshot when none exists for given campaignParticipationId', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      // when
      await knowledgeStateSnapshotRepository.save({
        knowledgeState: stateOf(['acquis1', 1]),
        campaignParticipationId,
      });

      // then
      const actualUserSnapshot = await knex.select('*').from('knowledge-state-snapshots').first();
      expect(actualUserSnapshot.campaignParticipationId).to.deep.equal(campaignParticipationId);
      expect(actualUserSnapshot.snapshot.version).to.equal(2);
      expect(Object.keys(actualUserSnapshot.snapshot.tubes)).to.deep.equal(['tube-acquis1']);
    });

    it('should update the existing snapshot for given campaignParticipationId', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();
      await knowledgeStateSnapshotRepository.save({
        knowledgeState: stateOf(['acquis1', 1], ['acquis2', 2]),
        campaignParticipationId,
      });

      // when
      await knowledgeStateSnapshotRepository.save({
        knowledgeState: stateOf(['acquis1', 1], ['acquis2', 2], ['acquis3', 3]),
        campaignParticipationId,
      });

      // then
      const snapshots = await knex.select('*').from('knowledge-state-snapshots');
      expect(snapshots).to.have.lengthOf(1);
      expect(Object.keys(snapshots[0].snapshot.tubes)).to.have.lengthOf(3);
    });

    context('when a transaction is given transaction', function () {
      it('saves the snapshot using a transaction', async function () {
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        await databaseBuilder.commit();

        await DomainTransaction.execute(async () => {
          await knowledgeStateSnapshotRepository.save({
            knowledgeState: stateOf(['acquis1', 1]),
            campaignParticipationId,
          });
        });

        const actualUserSnapshot = await knex.select('*').from('knowledge-state-snapshots').first();
        expect(actualUserSnapshot.campaignParticipationId).to.deep.equal(campaignParticipationId);
      });

      it('does not save the snapshot when the transaction fails', async function () {
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
        await databaseBuilder.commit();

        try {
          await DomainTransaction.execute(async () => {
            await knowledgeStateSnapshotRepository.save({
              knowledgeState: stateOf(['acquis1', 1]),
              campaignParticipationId,
            });
            throw new Error();
          });
          // eslint-disable-next-line no-empty
        } catch {}

        const snapshots = await knex.select('*').from('knowledge-state-snapshots');
        expect(snapshots).to.be.empty;
      });
    });
  });

  describe('#findByCampaignParticipationIds', function () {
    let campaignParticipationId, secondCampaignParticipationId;

    beforeEach(function () {
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      secondCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      return databaseBuilder.commit();
    });

    it('should return an empty object when there is no snapshot', async function () {
      // when
      const statesByParticipationId = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
        secondCampaignParticipationId,
      ]);
      // then
      expect(statesByParticipationId).to.deep.equal({});
    });

    it('should return only keys corresponding to existing snapshots, as knowledge states', async function () {
      // given
      await knowledgeStateSnapshotRepository.save({
        knowledgeState: stateOf(['acquis2', 2]),
        campaignParticipationId,
      });

      // when
      const statesByParticipationId = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
        secondCampaignParticipationId,
      ]);

      // then
      expect(Object.keys(statesByParticipationId)).to.deep.equal([String(campaignParticipationId)]);
      const reread = statesByParticipationId[campaignParticipationId];
      expect(reread).to.be.instanceOf(KnowledgeState);
      expect(reread.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis2']);
    });

    it('should still read snapshots written at the knowledge elements era', async function () {
      // given — un instantané au format historique, une entrée par acquis
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: toLegacySnapshot([
          {
            skillId: 'acquis1',
            status: 'validated',
            source: 'direct',
            earnedPix: 2,
            competenceId: 'recCompetenceSnapshot',
            createdAt: new Date('2019-01-01'),
          },
        ]),
      });
      await databaseBuilder.commit();

      // when
      const statesByParticipationId = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
      ]);

      // then
      const reread = statesByParticipationId[campaignParticipationId];
      expect(reread.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis1']);
    });
  });

  describe('#findCampaignParticipationKnowledgeStates', function () {
    it('should return one entry per requested participation, with a state frozen at sharing time', async function () {
      // given
      const participationWithSnapshotId = databaseBuilder.factory.buildCampaignParticipation().id;
      const participationWithoutSnapshotId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();
      await knowledgeStateSnapshotRepository.save({
        knowledgeState: stateOf(['acquis3', 3]),
        campaignParticipationId: participationWithSnapshotId,
      });

      // when
      const participationStates = await knowledgeStateSnapshotRepository.findCampaignParticipationKnowledgeStates([
        participationWithSnapshotId,
        participationWithoutSnapshotId,
      ]);

      // then
      expect(participationStates).to.have.lengthOf(2);
      const [withSnapshot, withoutSnapshot] = participationStates;
      expect(withSnapshot.campaignParticipationId).to.equal(participationWithSnapshotId);
      expect(withSnapshot.knowledgeState.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis3']);
      expect(withoutSnapshot.campaignParticipationId).to.equal(participationWithoutSnapshotId);
      expect(withoutSnapshot.knowledgeState.isEmpty).to.be.true;
    });
  });
});
