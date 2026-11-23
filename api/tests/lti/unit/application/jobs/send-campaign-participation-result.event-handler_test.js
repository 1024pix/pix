import { expect } from 'chai';
import sinon from 'sinon';

import { SendCampaignParticipationResultEventHandler } from '../../../../../src/lti/application/jobs/send-campaign-participation-result.event-handler.js';
import { CampaignSharedEvent } from '../../../../../src/shared/domain/events/CampaignSharedEvent.ts';

describe('Unit | LTI | Application | Jobs | SendCampaignParticipationResultEventHandler', function () {
  it('subscribes to the CampaignSharedEvent', function () {
    // when
    const handler = new SendCampaignParticipationResultEventHandler();

    // then
    expect(handler.jobName).to.equal('campaign-participation-shared.lti.event-queue');
    expect(handler.eventName).to.equal(CampaignSharedEvent.eventName);
  });

  it('never looses failed jobs', function () {
    // when
    const handler = new SendCampaignParticipationResultEventHandler();

    // then
    expect(handler.isDeadLetterQueueEnabled).to.be.true;
  });

  it('calls the sendCampaignParticipationResult use case', async function () {
    // given
    const handler = new SendCampaignParticipationResultEventHandler();
    const usecases = { sendCampaignParticipationResult: sinon.stub().resolves() };
    // the job queue serializes the event payload as JSON
    const data = JSON.parse(
      JSON.stringify(
        new CampaignSharedEvent({
          campaignId: 1,
          campaignParticipationId: 2,
          userId: 3,
          sharedAt: new Date('2026-01-01T10:00:00Z'),
        }).payload,
      ),
    );

    // when
    await handler.handle({ data, dependencies: { usecases } });

    // then
    expect(usecases.sendCampaignParticipationResult).to.have.been.calledOnceWithExactly({
      campaignId: 1,
      campaignParticipationId: 2,
      userId: 3,
      sharedAt: new Date('2026-01-01T10:00:00Z'),
    });
  });
});
