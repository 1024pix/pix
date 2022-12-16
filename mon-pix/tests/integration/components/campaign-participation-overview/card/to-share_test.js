import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card | ToShare', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('should render card info when card has "TO_SHARE" status', async function (assert) {
    // given
    const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      status: 'TO_SHARE',
      campaignTitle: 'My campaign',
      organizationName: 'My organization',
    });
    this.set('campaignParticipationOverview', campaignParticipationOverview);

    // when
    await render(hbs`<CampaignParticipationOverview::Card::ToShare @model={{this.campaignParticipationOverview}} />`);

    // then
    assert.ok(contains('My organization'));
    assert.ok(contains('My campaign'));
    assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.tag.completed').toUpperCase()));
    assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.send')));
    assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '10/12/2020' })));
  });
});
