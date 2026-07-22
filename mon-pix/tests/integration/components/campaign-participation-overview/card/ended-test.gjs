import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import Ended from 'mon-pix/components/campaign-participation-overview/card/ended';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card | Ended', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    class FeatureTogglesStub extends Service {
      featureToggles = { areCombinedCoursesEnabled: true };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);
  });
  module('when card has "ENDED" status', function () {
    test('should render card info ', async function (assert) {
      // given
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: true,
        createdAt: '2020-12-10T15:16:20.109Z',
        sharedAt: '2020-12-18T15:16:20.109Z',
        status: 'SHARED',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });

      // when
      const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);
      // then
      assert.ok(screen.getByRole('heading', { name: 'My organization' }));
      assert.ok(screen.getByText('My campaign'));
      assert.ok(screen.getByText(t('pages.campaign-participation-overview.card.tag.finished')));
      assert.ok(screen.getByText(t('pages.campaign-participation-overview.card.see-more')));
      assert.ok(screen.getByText(t('pages.campaign-participation-overview.card.finished-at', { date: '18/12/2020' })));
    });

    module('Conditional Button', function () {
      test('should redirect to campaigns', async function (assert) {
        // given
        this.owner.lookup('service:router');
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          campaignType: 'CAMPAIGN',
          campaignCode: '12345',
          organizationName: 'My organization',
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert
          .dom(screen.getByRole('link', { name: t('pages.campaign-participation-overview.card.see-more') }))
          .hasAttribute('href', '/campagnes/12345');
      });

      test('should redirect to combined courses', async function (assert) {
        // given
        this.owner.lookup('service:router');
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          campaignType: 'COMBINED_COURSE',
          campaignCode: '12345',
          organizationName: 'My organization',
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert
          .dom(screen.getByRole('link', { name: t('pages.campaign-participation-overview.card.see-more') }))
          .hasAttribute('href', '/parcours/12345');
      });
    });

    module('when the campaign has no stages', function () {
      test('should render the result with percentage', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          masteryRate: '0.20',
          totalStagesCount: 0,
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert.ok(screen.getByText('20 % de réussite'));
      });
    });

    module('when the campaign has stages', function () {
      test('should render the result with percentage', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          masteryRate: '0.70',
          validatedStagesCount: 5,
          totalStagesCount: 7,
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert.ok(screen.getByText('4 étoiles sur 6'));
      });
    });

    module('when canRetry is true', function () {
      test('should display retry button text', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          canRetry: true,
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert.ok(screen.getByText(t('pages.campaign-participation-overview.card.retry')));
      });
    });

    module('when canRetry is false', function () {
      test('should display see-more button text', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          status: 'SHARED',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          canRetry: false,
        });

        // when
        const screen = await render(<template><Ended @model={{campaignParticipationOverview}} /></template>);

        // then
        assert.ok(screen.getByText(t('pages.campaign-participation-overview.card.see-more')));
      });
    });
  });
});
