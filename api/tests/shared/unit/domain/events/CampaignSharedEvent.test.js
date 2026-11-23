import { expect } from 'chai';

import { CampaignSharedEvent } from '../../../../../src/shared/domain/events/CampaignSharedEvent.ts';

describe('Unit | Shared | Domain | Events | CampaignSharedEvent', function () {
  it('exposes its event name', function () {
    // given
    const sharedAt = new Date('2026-01-01');

    // when
    const event = new CampaignSharedEvent({ campaignId: 1, campaignParticipationId: 2, userId: 3, sharedAt });

    // then
    expect(event.eventName).to.equal('campaign-participation.shared');
    expect(CampaignSharedEvent.eventName).to.equal('campaign-participation.shared');
  });

  it('exposes its payload', function () {
    // given
    const sharedAt = new Date('2026-01-01');

    // when
    const event = new CampaignSharedEvent({ campaignId: 1, campaignParticipationId: 2, userId: 3, sharedAt });

    // then
    expect(event.payload).to.deep.equal({ campaignId: 1, campaignParticipationId: 2, userId: 3, sharedAt });
  });
});
