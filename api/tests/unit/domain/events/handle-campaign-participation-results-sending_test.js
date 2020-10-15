const { catchErr, expect, sinon } = require('../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const { handleCampaignParticipationResultsSending } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-campaign-participation-results-sending', () => {
  let event;

  const dependencies = {
    organizationRepository,
  };

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handleCampaignParticipationResultsSending)(
      { event, ...dependencies },
    );

    // then
    expect(error).not.to.be.null;
  });

  context('#handleCampaignParticipationResultsSending', () => {
    const campaignParticipationId = Symbol('campaignParticipationId');
    const campaignId = Symbol('campaignId');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: true,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log').resolves();
      });

      it('it should console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        expect(console.log).to.have.been.calledWithMatch('resultats mockés');
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: true,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: false });
        sinon.stub(console, 'log').resolves();
      });

      it('it should console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: false,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log').resolves();
      });

      it('it should console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });
  });
});
