import { UpdateEmptyKeSnapshotScript } from '../../../src/prescription/scripts/update-empty-snapshot-from-dwp.js';
import { KnowledgeElementCollection } from '../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, datawarehouseKnex, expect, knex, sinon } from '../../test-helper.js';

describe('Script | Prod | Update empty knowledge-element-snapshot snapshot (jsonb)', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // when
      const script = new UpdateEmptyKeSnapshotScript();
      const { options, description, permanent } = script.metaInfo;
      expect(permanent).to.be.false;
      expect(description).to.equal(
        'This script will copy knowledge-element-snapshots.snapshot from datawarehouse db to prod db',
      );
      // then
      expect(options.chunkSize).to.deep.include({
        type: 'number',
        default: 10000,
        description: 'number of records to update in one update',
      });
      expect(options.pauseDuration).to.deep.include({
        type: 'number',
        default: 2000,
        description: 'Time in ms between each chunk processing',
      });
      expect(options.firstId).to.deep.include({
        type: 'number',
        default: 0,
        describe: 'first knowledge-element-snapshot id with empty snapshot',
      });
      expect(options.lastId).to.deep.include({
        type: 'number',
        default: 21673844,
        describe: 'last knowledge-element-snapshot id with empty snapshot',
      });
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    let dependencies;
    let user, campaign, learner, keSnapshot1, emptyKeSnapshot2, emptyKeSnapshot3, expectedSnapshot1, expectedSnapshot2;

    beforeEach(async function () {
      await datawarehouseKnex.schema.dropTableIfExists('knowledge-element-snapshots');

      script = new UpdateEmptyKeSnapshotScript();
      logger = { info: sinon.spy(), error: sinon.spy(), debug: sinon.spy() };
      dependencies = { pause: sinon.stub() };

      campaign = databaseBuilder.factory.buildCampaign();
      user = databaseBuilder.factory.buildUser();
      learner = databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
      });
      const answer = databaseBuilder.factory.buildAnswer();
      const assessment = databaseBuilder.factory.buildAssessment();
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner.id,
        userId: user.id,
        campaign: campaign.id,
        participantExternalId: null,
        sharedAt: new Date('2025-01-01'),
      });
      const participation2 = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner.id,
        userId: user.id,
        campaign: campaign.id,
        participantExternalId: null,
        sharedAt: new Date('2025-01-02'),
      });
      const participation3 = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner.id,
        userId: user.id,
        campaign: campaign.id,
        participantExternalId: null,
        sharedAt: new Date('2025-01-03'),
      });

      const ke1 = databaseBuilder.factory.buildKnowledgeElement({
        competenceId: 'comp1',
        createdAt: new Date('2023-01-01'),
        earnedPix: 10,
        skillId: 'skill1',
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        assessmentId: assessment.id,
        answerId: answer.id,
        userId: user.id,
      });

      const ke2 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        createdAt: new Date('2023-01-02'),
        skillId: 'skill2',
        assessmentId: assessment.id,
        answerId: answer.id,
        userId: user.id,
        competenceId: 'comp2',
        earnedPix: 20,
      });

      keSnapshot1 = databaseBuilder.factory.buildKnowledgeElementSnapshot({
        id: 1,
        snapshot: new KnowledgeElementCollection([ke1]).toSnapshot(),
        campaignParticipationId: participation.id,
      });

      emptyKeSnapshot2 = databaseBuilder.factory.buildKnowledgeElementSnapshot({
        id: 2,
        snapshot: JSON.stringify([]),
        campaignParticipationId: participation2.id,
      });

      emptyKeSnapshot3 = databaseBuilder.factory.buildKnowledgeElementSnapshot({
        id: 3,
        snapshot: JSON.stringify([]),
        campaignParticipationId: participation3.id,
      });

      expectedSnapshot1 = [
        {
          competenceId: ke1.competenceId,
          createdAt: ke1.createdAt.toISOString(),
          earnedPix: ke1.earnedPix,
          skillId: ke1.skillId,
          source: ke1.source,
          status: ke1.status,
        },
      ];

      expectedSnapshot2 = [
        {
          competenceId: ke2.competenceId,
          createdAt: ke2.createdAt.toISOString(),
          earnedPix: ke2.earnedPix,
          skillId: ke2.skillId,
          source: ke2.source,
          status: ke2.status,
        },
      ];

      await databaseBuilder.commit();

      // build dwhp data
      await datawarehouseKnex.schema.createTable('knowledge-element-snapshots', (table) => {
        table.increments('id').primary();
        table.jsonb('snapshot').notNullable();
        table.integer('campaignParticipationId').unsigned().nullable();
      });
      await datawarehouseKnex('knowledge-element-snapshots').insert({ ...keSnapshot1 });
      await datawarehouseKnex('knowledge-element-snapshots').insert({
        ...emptyKeSnapshot2,
        snapshot: new KnowledgeElementCollection([ke2]).toSnapshot(),
      });

      await datawarehouseKnex('knowledge-element-snapshots').insert({
        ...emptyKeSnapshot3,
        snapshot: new KnowledgeElementCollection([ke2]).toSnapshot(),
      });
    });

    it('should copy snapshot from datawarehouse', async function () {
      // when
      await script.handle({ options: { pauseDuration: 0, firstId: 0, lastId: 2 }, logger, dependencies });

      // then
      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'UpdateEmptyKeSnapshotScript' },
        'Start fixing knowledge-element-snapshots empty snapshots.',
      );
      const snapshots = await knex('knowledge-element-snapshots')
        .select('id', 'campaignParticipationId', 'snapshot')
        .orderBy('id');

      expect(snapshots).deep.equal([
        { id: 1, snapshot: expectedSnapshot1, campaignParticipationId: keSnapshot1.campaignParticipationId },
        { id: 2, snapshot: expectedSnapshot2, campaignParticipationId: emptyKeSnapshot2.campaignParticipationId },
        { id: 3, snapshot: [], campaignParticipationId: emptyKeSnapshot3.campaignParticipationId },
      ]);
    });

    it('should start at firstId id', async function () {
      // when
      await script.handle({ options: { pauseDuration: 0, firstId: 3, lastId: 3 }, logger, dependencies });

      const rows = await knex('knowledge-element-snapshots').select('snapshot');

      expect(rows).deep.equal([
        { id: 1, snapshot: expectedSnapshot1, campaignParticipationId: keSnapshot1.campaignParticipationId },
        { id: 2, snapshot: [], campaignParticipationId: emptyKeSnapshot2.campaignParticipationId },
        { id: 3, snapshot: [expectedSnapshot2], campaignParticipationId: emptyKeSnapshot3.campaignParticipationId },
      ]);
    });

    it('should stop at last id', async function () {
      // when
      await script.handle({ options: { pauseDuration: 0, firstId: 1, lastId: 2 }, logger, dependencies });

      // then
      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'UpdateEmptyKeSnapshotScript' },
        'Start fixing knowledge-element-snapshots empty snapshots.',
      );
      const row = await knex('knowledge-element-snapshots').select('snapshot').where({ id: 3 }).first();

      expect(row.snapshot).deep.equal([]);
    });

    it('should clean snapshot one by one', async function () {
      // given
      const options = { chunkSize: 1, pauseDuration: 0, firstId: 0, lastId: 3 };

      // when
      await script.handle({ options, logger, dependencies });

      // then
      const snapshots = await knex('knowledge-element-snapshots')
        .select('id', 'campaignParticipationId', 'snapshot')
        .orderBy('id');

      expect(snapshots).deep.equal([
        { id: 1, snapshot: expectedSnapshot1, campaignParticipationId: keSnapshot1.campaignParticipationId },
        { id: 2, snapshot: expectedSnapshot2, campaignParticipationId: emptyKeSnapshot2.campaignParticipationId },
        { id: 3, snapshot: expectedSnapshot2, campaignParticipationId: emptyKeSnapshot3.campaignParticipationId },
      ]);
      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'UpdateEmptyKeSnapshotScript' },
        'updated 1 knowledge-element-snapshots rows with empty snapshots.',
      );
      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'UpdateEmptyKeSnapshotScript' },
        'updated 1 knowledge-element-snapshots rows with empty snapshots.',
      );
      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'UpdateEmptyKeSnapshotScript' },
        'updated 1 knowledge-element-snapshots rows with empty snapshots.',
      );
    });

    it('should pause between chunks', async function () {
      // given
      const options = { chunkSize: 2, pauseDuration: 10, firstId: 0, lastId: 3 };

      // when
      await script.handle({ options, logger, dependencies });

      // then
      expect(dependencies.pause).to.have.been.calledOnceWithExactly(10);
    });
  });
});
