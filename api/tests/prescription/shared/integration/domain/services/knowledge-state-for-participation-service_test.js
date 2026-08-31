import * as knowledgeStateSnapshotRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import knowledgeStateForParticipationService from '../../../../../../src/prescription/shared/domain/services/knowledge-state-for-participation-service.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Domain | Services | knowledge-state-for-participation-service', function () {
  beforeEach(async function () {
    [1, 2, 3].forEach((level) =>
      databaseBuilder.factory.learningContent.buildSkill({
        id: `acquis${level}`,
        name: `@leTube${level}`,
        level,
        tubeId: 'leTube',
        competenceId: 'laCompetence',
        status: 'actif',
        pixValue: 2,
      }),
    );
    await databaseBuilder.commit();
  });

  const buildParticipation = ({ type }) => {
    const userId = databaseBuilder.factory.buildUser().id;
    const campaignId = databaseBuilder.factory.buildCampaign({ type }).id;
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
    }).id;
    return { userId, campaignParticipationId };
  };

  describe('#findByUserOrCampaignParticipationId', function () {
    it('reads the living user state for an assessment campaign', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'leTube', floor: 2, directLevels: [2] });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId,
      });

      // then
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.have.members(['acquis1', 'acquis2']);
    });

    it('reads the frozen snapshot for a shared assessment participation, even after the living state is gone', async function () {
      // given — participation partagée, puis état vivant amputé par un reset
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.ASSESSMENT });
      await databaseBuilder.commit();

      const stateAtSharing = new KnowledgeState().withAnswer({
        skill: { id: 'acquis2', tubeId: 'leTube', difficulty: 2 },
        isOk: true,
      });
      await knowledgeStateSnapshotRepository.save({ knowledgeState: stateAtSharing, campaignParticipationId });

      // when
      const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId,
        limitDate: new Date(),
      });

      // then
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.have.members(['acquis1', 'acquis2']);
    });

    it('falls back to the living state when a shared participation has no snapshot', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'leTube', floor: 1, directLevels: [1] });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId,
        limitDate: new Date(),
      });

      // then
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis1']);
    });

    it('reads the participation snapshot for an EXAM campaign, isolated from the user profile', async function () {
      // given — le profil global de l'utilisateur ne doit pas transparaître
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.EXAM });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'leTube', floor: 3, directLevels: [3] });
      await databaseBuilder.commit();

      const examState = new KnowledgeState().withAnswer({
        skill: { id: 'acquis1', tubeId: 'leTube', difficulty: 1 },
        isOk: true,
      });
      await knowledgeStateForParticipationService.save({
        knowledgeState: examState,
        userId,
        campaignParticipationId,
      });

      // when
      const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId,
      });

      // then
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis1']);
    });

    it('throws for an unknown campaign participation', async function () {
      // when
      const error = await catchErr(
        knowledgeStateForParticipationService.findByUserOrCampaignParticipationId,
        knowledgeStateForParticipationService,
      )({ userId: 123, campaignParticipationId: 456 });

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Invalid campaign participation 456');
    });
  });

  describe('#save', function () {
    it('tightens the living user state for an assessment campaign, one row for the answered tube', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.ASSESSMENT });
      await databaseBuilder.commit();

      const knowledgeState = new KnowledgeState().withAnswer({
        skill: { id: 'acquis2', tubeId: 'leTube', difficulty: 2 },
        isOk: true,
      });

      // when
      await knowledgeStateForParticipationService.save({
        knowledgeState,
        tubeIds: ['leTube'],
        userId,
        campaignParticipationId,
      });

      // then
      const rows = await knex('knowledge-states').where({ userId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.include({ tubeId: 'leTube', floor: 2 });
      expect(await knex('knowledge-state-snapshots')).to.be.empty;
    });

    it('writes the participation snapshot for an EXAM campaign, leaving the user state untouched', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.EXAM });
      await databaseBuilder.commit();

      const knowledgeState = new KnowledgeState().withAnswer({
        skill: { id: 'acquis1', tubeId: 'leTube', difficulty: 1 },
        isOk: false,
      });

      // when
      await knowledgeStateForParticipationService.save({
        knowledgeState,
        tubeIds: ['leTube'],
        userId,
        campaignParticipationId,
      });

      // then
      expect(await knex('knowledge-states').where({ userId })).to.be.empty;
      const [snapshotRow] = await knex('knowledge-state-snapshots').where({ campaignParticipationId });
      expect(snapshotRow.snapshot.tubes.leTube.ceiling).to.equal(1);
    });
  });

  describe('#findByUsersOrCampaignParticipationIds', function () {
    it('reads living states by user when not fetching from snapshots', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'leTube', floor: 1, directLevels: [1] });
      await databaseBuilder.commit();

      // when
      const results = await knowledgeStateForParticipationService.findByUsersOrCampaignParticipationIds({
        participationInfos: [{ userId, campaignParticipationId }],
        fetchFromSnapshot: false,
      });

      // then
      expect(results).to.have.lengthOf(1);
      expect(results[0].userId).to.equal(userId);
      expect(results[0].knowledgeState.validatedSkills().map(({ id }) => id)).to.deep.equal(['acquis1']);
    });

    it('reads frozen states by participation when fetching from snapshots', async function () {
      // given
      const { userId, campaignParticipationId } = buildParticipation({ type: CampaignTypes.EXAM });
      await databaseBuilder.commit();
      await knowledgeStateForParticipationService.save({
        knowledgeState: new KnowledgeState().withAnswer({
          skill: { id: 'acquis3', tubeId: 'leTube', difficulty: 3 },
          isOk: true,
        }),
        userId,
        campaignParticipationId,
      });

      // when
      const results = await knowledgeStateForParticipationService.findByUsersOrCampaignParticipationIds({
        participationInfos: [{ userId, campaignParticipationId }],
        fetchFromSnapshot: true,
      });

      // then
      expect(results).to.have.lengthOf(1);
      expect(results[0].campaignParticipationId).to.equal(campaignParticipationId);
      expect(results[0].knowledgeState.validatedSkills().map(({ id }) => id)).to.have.members([
        'acquis1',
        'acquis2',
        'acquis3',
      ]);
    });
  });
});
