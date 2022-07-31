import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
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
        assert.dom(contains('My organization')).exists();
        assert.dom(contains('My campaign')).exists();
        assert.dom(
          contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.')
        ).exists();
        assert
          .dom(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase()))
          .exists();
        assert
          .dom(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' })))
          .exists();
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
        assert.dom(contains('My organization')).exists();
        assert.dom(contains('My campaign')).exists();
        assert
          .dom(contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.'))
          .exists();
        assert
          .dom(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase()))
          .exists();
        assert
          .dom(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' })))
          .exists();
      });
    });

    module('when the participation is completed', function () {
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
          assert.dom(contains('56 % de réussite')).exists();
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
            totalStagesCount: 3,
            validatedStagesCount: 1,
          });

          this.set('campaignParticipationOverview', campaignParticipationOverview);

          // when
          const screen = await renderScreen(
            hbs`<CampaignParticipationOverview::Card::Disabled @model={{campaignParticipationOverview}} />`
          );

          // then
          assert.dom(screen.getByLabelText('1 étoile sur 3')).exists();
        });
      });
    });
  });
});
