import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card | Archived', function () {
  setupIntlRenderingTest();
  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('when card has "ARCHIVED" status', function () {
    context('when the participation is not completed', () => {
      it('should render explanatory text given started status', async function () {
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
        expect(contains('My organization')).to.exist;
        expect(contains('My campaign')).to.exist;
        expect(contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.')).to
          .exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase())).to.exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' })))
          .to.exist;
      });

      it('should render explanatory text given to_share status', async function () {
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
        expect(contains('My organization')).to.exist;
        expect(contains('My campaign')).to.exist;
        expect(contains('Parcours désactivé par votre organisation.\nVous ne pouvez plus envoyer vos résultats.')).to
          .exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.tag.disabled').toUpperCase())).to.exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' })))
          .to.exist;
      });

      it('should not display go to details link', async function () {
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
        expect(contains('Voir le détail')).to.not.exist;
      });
    });

    context('when the participation is completed', function () {
      it('should display go to details link', async function () {
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
        expect(contains('Voir le détail')).to.exist;
      });

      context('when the participation has a mastery percentage', () => {
        it('should render the result with percentage', async function () {
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
          expect(contains('56 % de réussite')).to.exist;
        });
      });

      context('when the campaign has stages', () => {
        it('should render the result with stars', async function () {
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
          expect(screen.getByLabelText('1 étoile sur 3')).to.exist;
        });
      });
    });
  });
});
