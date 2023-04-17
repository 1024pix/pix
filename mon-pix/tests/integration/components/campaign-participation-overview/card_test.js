import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the participation status is ONGOING', function () {
    test('should display CardOngoing', async function (assert) {
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
        hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`
      );

      // then
      assert.dom(screen.getByText('En cours')).exists();
    });
  });

  module('when the participation status is TO_SHARE', function () {
    test('should display CardToShare', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
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
        hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`
      );

      // then
      assert.dom(screen.getByText('À envoyer')).exists();
    });
  });

  module('when the participation status is ENDED', function () {
    test('should display CardEnded', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: true,
        createdAt: '2020-12-10T15:16:20.109Z',
        status: 'SHARED',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
        masteryPercentage: 20,
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      // when
      const screen = await render(
        hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`
      );

      // then
      assert.dom(screen.getByText('Terminé')).exists();
    });
  });

  module('when the participation status is DISABLED', function () {
    test('should display CardDisabled', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-18T15:16:20.109Z',
        disabledAt: '2020-12-10T15:16:20.109Z',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      // when
      const screen = await render(
        hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`
      );

      // then
      assert.dom(screen.getByText('Inactif')).exists();
    });
  });
});
