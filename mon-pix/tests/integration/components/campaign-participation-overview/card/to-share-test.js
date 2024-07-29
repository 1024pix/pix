import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

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
    const screen = await render(
      hbs`<CampaignParticipationOverview::Card::ToShare @model={{this.campaignParticipationOverview}} />`,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: 'My organization' }));
    assert.ok(screen.getByText('My campaign'));
    assert.ok(screen.getByText(this.intl.t('pages.campaign-participation-overview.card.tag.completed')));
    assert.ok(screen.getByText(this.intl.t('pages.campaign-participation-overview.card.send')));
    assert.ok(
      screen.getByText(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '10/12/2020' })),
    );
  });
});
