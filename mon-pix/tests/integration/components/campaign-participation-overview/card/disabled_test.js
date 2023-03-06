import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignParticipationOverview | Card | Archived', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('when card has "ARCHIVED" status', function () {
    module('when the participation is not completed', function () {
      test('should render explanatory text given started status', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          disabledAt: '2020-01-03',
          status: 'STARTED',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryRate: null,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(
          hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.ok(contains('My organization'));
        assert.ok(contains('My campaign'));
        assert.ok(contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.'));
        assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase()));
        assert.ok(
          contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' }))
        );
      });

      test('should render explanatory text given to_share status', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          disabledAt: '2020-01-03',
          status: 'TO_SHARE',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryRate: null,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(
          hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.ok(contains('My organization'));
        assert.ok(contains('My campaign'));
        assert.ok(contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.'));
        assert.ok(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase()));
        assert.ok(
          contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' }))
        );
      });

      test('should not display go to details link', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          disabledAt: '2020-01-03',
          status: 'TO_SHARE',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryRate: null,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(
          hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.notOk(contains('Voir le détail'));
      });
    });

    module('when the participation is completed', function () {
      test('should display go to details link', async function (assert) {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          disabledAt: '2020-01-03',
          status: 'SHARED',
          isShared: true,
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryRate: 0.56,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(
          hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
        );

        // then
        assert.ok(contains('Voir le détail'));
      });

      module('when the participation has a mastery percentage', function () {
        test('should render the result with percentage', async function (assert) {
          // given
          const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
            createdAt: '2020-01-01',
            disabledAt: '2020-01-03',
            status: 'SHARED',
            isShared: true,
            campaignTitle: 'My campaign',
            organizationName: 'My organization',
            masteryRate: 0.56,
          });
          this.set('campaignParticipationOverview', campaignParticipationOverview);

          // when
          await render(
            hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
          );

          // then
          assert.ok(contains('56 % de réussite'));
        });
      });

      module('when the campaign has stages', function () {
        test('should render the result with stars', async function (assert) {
          // given
          const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
            createdAt: '2020-01-01',
            disabledAt: '2020-01-03',
            status: 'SHARED',
            isShared: true,
            campaignTitle: 'My campaign',
            organizationName: 'My organization',
            masteryRate: '0.56',
            totalStagesCount: 4,
            validatedStagesCount: 2,
          });
          this.set('campaignParticipationOverview', campaignParticipationOverview);

          // when
          const screen = await render(
            hbs`<CampaignParticipationOverview::Card::Disabled @model={{this.campaignParticipationOverview}} />`
          );

          // then
          assert.ok(screen.getByText('1 étoile sur 3'));
        });
      });
    });
  });
});
