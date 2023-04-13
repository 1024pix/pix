import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card | Ongoing ', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render card info when card has "ONGOING" status', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      status: 'STARTED',
      campaignTitle: 'My campaign',
      organizationName: 'My organization',
    });
    this.set('campaignParticipationOverview', campaignParticipationOverview);

    // when
    const screen = await render(
      hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />`
    );

    // then
    assert.dom(screen.getByRole('link', { name: 'Reprendre le parcours My campaign' })).exists();
    assert.dom(screen.getByRole('heading', { name: 'My organization', level: 2 })).exists();
    assert.dom(screen.getByText('My campaign')).exists();
    assert.dom(screen.getByText('En cours')).exists();
    assert.dom(screen.getByText('Commencé le 10/12/2020')).exists();
  });
});
