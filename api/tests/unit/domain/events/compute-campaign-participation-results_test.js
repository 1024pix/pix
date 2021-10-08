const sinon = require('sinon');
const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const computeCampaignParticipationResults = require('../../../../lib/domain/events/compute-campaign-participation-results');

describe('Unit | Domain | Events | compute-campaign-participation-results', function () {
  it('Should trigger ComputeCampaignParticipationResults on CampaignParticipationResultsShared event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CampaignParticipationResultsShared();
    const domainTransaction = Symbol('a transaction');

    // when
    await eventDispatcher.dispatch(event, domainTransaction);

    // then
    expect(handlerStubs.computeCampaignParticipationResults).to.have.been.calledWith({ event, domainTransaction });
  });

  it('should compute and save results on the campaign participation', async function () {
    // given
    const participationResultsShared = Symbol('participation results shared');
    const event = new CampaignParticipationResultsShared({ campaignParticipationId: 1 });
    const participantResultsSharedRepository = { get: sinon.stub().withArgs(1).resolves(participationResultsShared) };
    const campaignParticipationRepository = { update: sinon.stub() };

    // when
    await computeCampaignParticipationResults({
      event,
      participantResultsSharedRepository,
      campaignParticipationRepository,
    });

    // then
    expect(campaignParticipationRepository.update).to.have.been.calledWith(participationResultsShared);
  });
});
