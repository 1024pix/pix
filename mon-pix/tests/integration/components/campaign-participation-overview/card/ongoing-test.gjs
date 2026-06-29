import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Card from 'mon-pix/components/campaign-participation-overview/card';
import Ongoing from 'mon-pix/components/campaign-participation-overview/card/ongoing';
import { module, test } from 'qunit';

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
      campaignCode: 'CAMPAIGN',
      organizationName: 'My organization',
    });

    // when
    const screen = await render(<template><Card @model={{campaignParticipationOverview}} /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: 'Reprendre le parcours My campaign' })).exists();
    assert.dom(screen.getByRole('heading', { name: 'My organization', level: 2 })).exists();
    assert.dom(screen.getByText('My campaign')).exists();
    assert.dom(screen.getByText('En cours')).exists();
    assert.dom(screen.getByText('Commencé le 10/12/2020')).exists();
  });

  module('Conditional Button', function () {
    test('should redirect to campaigns', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.owner.lookup('service:router');
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        sharedAt: null,
        status: 'STARTED',
        campaignTitle: 'My campaign',
        campaignType: 'CAMPAIGN',
        campaignCode: '12345',
        organizationName: 'My organization',
      });

      // when
      const screen = await render(<template><Ongoing @model={{campaignParticipationOverview}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('link', {
            name: t('pages.campaign-participation-overview.card.resume.extra-information', {
              campaignTitle: 'My campaign',
            }),
          }),
        )
        .hasAttribute('href', '/campagnes/12345');
    });

    test('should redirect to combined courses', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.owner.lookup('service:router');
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        sharedAt: null,
        status: 'STARTED',
        campaignTitle: 'My campaign',
        campaignType: 'COMBINED_COURSE',
        campaignCode: '12345',
        organizationName: 'My organization',
      });

      // when
      const screen = await render(<template><Ongoing @model={{campaignParticipationOverview}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('link', {
            name: t('pages.campaign-participation-overview.card.resume.extra-information', {
              campaignTitle: 'My campaign',
            }),
          }),
        )
        .hasAttribute('href', '/parcours/12345');
    });
  });
});
