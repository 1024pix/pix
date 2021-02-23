import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card | Ongoing ', function() {
  setupIntlRenderingTest();
  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('should render card info when card has "ONGOING" status', async function() {
    // given
    const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      assessmentState: 'started',
      campaignTitle: 'My campaign',
      organizationName: 'My organization',
    });
    this.set('campaignParticipationOverview', campaignParticipationOverview);

    // when
    await render(hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />`);

    // then
    expect(contains('My organization')).to.exist;
    expect(contains('My campaign')).to.exist;
    expect(contains(this.intl.t('pages.campaign-participation-overview.card.tag.started'))).to.exist;
    expect(contains(this.intl.t('pages.campaign-participation-overview.card.resume'))).to.exist;
    expect(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '10/12/2020' }))).to.exist;
  });
});
