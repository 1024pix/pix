import { AddMissingKnowledgeElementSnapshots } from '../../../src/prescription/scripts/add-missing-knowledge-element-snapshots.js';
import { CampaignTypes } from '../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect, knex, sinon } from '../../test-helper.js';

describe('Integration | Prescription | Scripts | add-missing-knowledge-element-snapshots', function () {
  let script;
  let loggerStub;

  before(async function () {
    script = new AddMissingKnowledgeElementSnapshots();
    loggerStub = { info: sinon.stub(), error: sinon.stub(), warning: sinon.stub() };
  });

  describe('Options', function () {
    it('has the correct options', function () {
      const { options } = script.metaInfo;
      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'execute script without commit',
        demandOption: false,
        default: true,
      });
      expect(options.campaignParticipationIds).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated campaign participation ids',
        demandOption: true,
      });
    });
  });

  describe('#handle', function () {
    it("should create ke-snapshot for participation when they don't exists", async function () {
      //given
      const createdAt1 = new Date('2023-01-02T09:50:00Z');
      const sharedAt1 = new Date('2023-01-02T10:00:00Z');
      const createdAt2 = new Date('2023-01-03T10:00:00Z');
      const sharedAt2 = new Date('2023-01-03T10:00:00Z');

      const user = databaseBuilder.factory.buildUser();
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        createdAt: createdAt1,
        sharedAt: sharedAt1,
      });
      const participationWithsnapshot = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        createdAt: createdAt2,
        sharedAt: sharedAt2,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationWithsnapshot.id,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        options: { campaignParticipationIds: [participation.id, participationWithsnapshot.id], dryRun: false },
        logger: loggerStub,
      });

      // then
      const result = await knex('knowledge-element-snapshots')
        .orderBy('snappedAt', 'asc')
        .pluck('campaignParticipationId');

      expect(result).to.deep.equal([participation.id, participationWithsnapshot.id]);
      expect(loggerStub.error).calledWithExactly(
        `add-remove-knowledge-element-snapshot | We are skipping this campaignParticipation ${participationWithsnapshot.id} because a snapshot already exists for it.`,
      );
      expect(loggerStub.info).calledWithExactly(
        'add-remove-knowledge-element-snapshot | Created 1 snapshots. Skipped 1 participations',
      );
    });
    context('when campaign participation does not exist', function () {
      it('should skip participation and log an error', async function () {
        // when
        await script.handle({
          options: { campaignParticipationIds: ['123'], dryRun: false },
          logger: loggerStub,
        });
        expect(loggerStub.error).calledWithExactly(
          'add-remove-knowledge-element-snapshot | Skip campaign participation 123, campaign not found',
        );
      });
    });
    context('when campaign is of type exam', function () {
      it('should skip participation and log an error', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
        const participation = databaseBuilder.factory.buildCampaignParticipation({
          userId: user.id,
          campaignId: campaign.id,
          createdAt: new Date('2023-01-02T09:50:00Z'),
          sharedAt: new Date('2023-01-02T10:50:00Z'),
        });
        await databaseBuilder.commit();
        // when
        await script.handle({
          options: { campaignParticipationIds: [participation.id], dryRun: false },
          logger: loggerStub,
        });
        expect(loggerStub.error).calledWithExactly(
          `add-remove-knowledge-element-snapshot | Skip campaign participation ${participation.id}, campaign to exam`,
        );
      });
    });
    context('when there is knowledge-element after participation sharing date', function () {
      it('should save the knowledge elements before sharing date', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const campaign = databaseBuilder.factory.buildCampaign();
        const participation = databaseBuilder.factory.buildCampaignParticipation({
          userId: user.id,
          campaignId: campaign.id,
          createdAt: new Date('2023-01-02T09:50:00Z'),
          sharedAt: new Date('2023-01-02T10:50:00Z'),
        });
        const ke1 = databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          createdAt: new Date('2023-01-01T10:50:00Z'),
          skillId: 'skillId1',
        });

        databaseBuilder.factory.buildKnowledgeElement({
          userId: user.id,
          createdAt: new Date('2023-01-03T10:50:00Z'),
          skillId: 'skillId1',
        });

        await databaseBuilder.commit();
        // when
        await script.handle({
          options: { campaignParticipationIds: [participation.id], dryRun: false },
          logger: loggerStub,
        });
        const result = await knex('knowledge-element-snapshots')
          .where({ campaignParticipationId: participation.id })
          .first();

        expect(result.snapshot).lengthOf(1);
        expect(result.snapshot[0].skillId).equal(ke1.skillId);
      });
    });
  });
});
