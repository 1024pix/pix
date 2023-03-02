import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
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
      assert.ok(contains('My organization'));
      assert.ok(contains('My campaign'));
      assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.tag.finished')));
      assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.see-more')));
      assert.ok(
        contains(this.intl.t('pages.campaign-participation-overview.card.finished-at', { date: '18/12/2020' }))
      );
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
        assert.ok(contains('20 % de réussite'));
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
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        const screen = await render(
          hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.ok(screen.getByLabelText('4 étoiles sur 6'));
      });
    });
  });
});
