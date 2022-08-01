import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card | Ended', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
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
      this.set('campaignParticipationOverview', campaignParticipationOverview);

      // when
      await render(hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`);

      // then
      assert.dom(contains('My organization')).exists();
      assert.dom(contains('My campaign')).exists();
      assert.dom(contains(this.intl.t('pages.campaign-participation-overview.card.tag.finished'))).exists();
      assert.dom(contains(this.intl.t('pages.campaign-participation-overview.card.see-more'))).exists();
      assert
        .dom(contains(this.intl.t('pages.campaign-participation-overview.card.finished-at', { date: '18/12/2020' })))
        .exists();
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
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`);

        // then
        assert.dom(contains('20 % de réussite')).exists();
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
          validatedStagesCount: 4,
          totalStagesCount: 6,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        const screen = await renderScreen(
          hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.dom(screen.getByLabelText('4 étoiles sur 6')).exists();
      });
    });
  });
});
