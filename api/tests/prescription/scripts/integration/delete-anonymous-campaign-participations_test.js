import sinon from 'sinon';

import { DeleteAnonymousCampaignParticipationsScript } from '../../../../src/prescription/scripts/delete-anonymous-campaign-participations.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAnonymousCampaignParticipationsScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAnonymousCampaignParticipationsScript();
      const { options } = script.metaInfo;

      expect(options.campaignCodes).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated campaign codes',
        demandOption: true,
      });
      expect(options.dryRun).to.deep.include({ type: 'boolean', default: true });
    });

    it('parses the list of campaign codes', function () {
      const script = new DeleteAnonymousCampaignParticipationsScript();
      const { options } = script.metaInfo;

      expect(options.campaignCodes.coerce('ABCDEF123,GHIJKL456')).to.deep.equal(['ABCDEF123', 'GHIJKL456']);
    });

    it('parses the dates', function () {
      const script = new DeleteAnonymousCampaignParticipationsScript();
      const { options } = script.metaInfo;

      expect(options.createdAfter.coerce('2026-07-21')).to.deep.equal(new Date('2026-07-21'));
      expect(() => options.createdBefore.coerce('21/07/2026')).to.throw('Invalid date format');
    });
  });

  describe('Handle', function () {
    let script, logger, campaign;

    /** One journey as the API writes it: user, learner, participation, assessment, answer and KE. */
    function buildAnonymousJourney({ campaignId, createdAt = new Date('2026-07-21') }) {
      const userId = databaseBuilder.factory.buildUser({ isAnonymous: true }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        organizationLearnerId,
        createdAt,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId }).id;
      const answerId = databaseBuilder.factory.buildAnswer({ assessmentId }).id;
      databaseBuilder.factory.buildKnowledgeElement({ userId, assessmentId, answerId });

      return { userId, organizationLearnerId, campaignParticipationId, assessmentId, answerId };
    }

    beforeEach(function () {
      script = new DeleteAnonymousCampaignParticipationsScript();
      logger = { info: sinon.spy(), warn: sinon.spy(), error: sinon.spy() };
      campaign = databaseBuilder.factory.buildCampaign({ code: 'ANONYM001' });
    });

    it('deletes the whole journey of every anonymous participant', async function () {
      // given
      const journey = buildAnonymousJourney({ campaignId: campaign.id });
      await databaseBuilder.commit();

      // when
      await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: false }, logger });

      // then
      expect(await knex('users').where({ id: journey.userId }).first()).to.be.undefined;
      expect(await knex('organization-learners').where({ id: journey.organizationLearnerId }).first()).to.be.undefined;
      expect(await knex('campaign-participations').where({ id: journey.campaignParticipationId }).first()).to.be
        .undefined;
      expect(await knex('assessments').where({ id: journey.assessmentId }).first()).to.be.undefined;
      expect(await knex('answers').where({ id: journey.answerId }).first()).to.be.undefined;
      expect(await knex('knowledge-elements').where({ userId: journey.userId }).first()).to.be.undefined;
    });

    it('leaves the participants who have an account alone', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({ isAnonymous: false }).id;
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: false }, logger });

      // then
      expect(await knex('users').where({ id: userId }).first()).to.exist;
      expect(await knex('campaign-participations').where({ id: campaignParticipationId }).first()).to.exist;
    });

    it('leaves the anonymous participants of the other campaigns alone', async function () {
      // given
      const otherCampaign = databaseBuilder.factory.buildCampaign({ code: 'ANONYM002' });
      const journey = buildAnonymousJourney({ campaignId: otherCampaign.id });
      await databaseBuilder.commit();

      // when
      await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: false }, logger });

      // then
      expect(await knex('users').where({ id: journey.userId }).first()).to.exist;
      expect(await knex('answers').where({ id: journey.answerId }).first()).to.exist;
    });

    it('skips a participant who also took part in a campaign out of scope', async function () {
      // given
      const otherCampaign = databaseBuilder.factory.buildCampaign({ code: 'ANONYM002' });
      const journey = buildAnonymousJourney({ campaignId: campaign.id });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaign.id,
        userId: journey.userId,
      });
      await databaseBuilder.commit();

      // when
      const result = await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: false }, logger });

      // then
      expect(result.skippedUserIds).to.deep.equal([journey.userId]);
      expect(await knex('users').where({ id: journey.userId }).first()).to.exist;
      expect(await knex('campaign-participations').where({ id: journey.campaignParticipationId }).first()).to.exist;
      expect(logger.warn).to.have.been.calledWithMatch(`User ${journey.userId} skipped`);
    });

    it('deletes nothing on a dry run, and counts what it would delete', async function () {
      // given
      const journey = buildAnonymousJourney({ campaignId: campaign.id });
      await databaseBuilder.commit();

      // when
      const result = await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: true }, logger });

      // then
      // user + learner + participation + assessment + answer + knowledge-element
      expect(result.affectedRowCount).to.equal(6);
      expect(result.userIds).to.deep.equal([journey.userId]);
      expect(await knex('users').where({ id: journey.userId }).first()).to.exist;
      expect(await knex('answers').where({ id: journey.answerId }).first()).to.exist;
    });

    it('honours the creation window', async function () {
      // given
      const before = buildAnonymousJourney({ campaignId: campaign.id, createdAt: new Date('2026-07-20') });
      const inside = buildAnonymousJourney({ campaignId: campaign.id, createdAt: new Date('2026-07-22') });
      await databaseBuilder.commit();

      // when
      await script.handle({
        options: { campaignCodes: ['ANONYM001'], createdAfter: new Date('2026-07-21'), dryRun: false },
        logger,
      });

      // then
      expect(await knex('users').where({ id: before.userId }).first()).to.exist;
      expect(await knex('users').where({ id: inside.userId }).first()).to.be.undefined;
    });

    it('does nothing when the campaign has no anonymous participant', async function () {
      // given
      await databaseBuilder.commit();

      // when
      const result = await script.handle({ options: { campaignCodes: ['ANONYM001'], dryRun: false }, logger });

      // then
      expect(result).to.deep.equal({ userIds: [], skippedUserIds: [], affectedRowCount: 0 });
    });

    it('refuses to run on an unknown campaign code', async function () {
      // given
      await databaseBuilder.commit();

      // when
      const error = await script
        .handle({ options: { campaignCodes: ['NOPE'], dryRun: false }, logger })
        .catch((e) => e);

      // then
      expect(error.message).to.equal('Unknown campaign code(s): NOPE');
    });
  });
});
