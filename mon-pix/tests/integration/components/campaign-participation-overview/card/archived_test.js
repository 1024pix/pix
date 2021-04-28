import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card | Archived', function() {
  setupIntlRenderingTest();
  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  describe('when card has "ARCHIVED" status', function() {
    context('when the participation doesn\'t have a mastery percentage', ()=> {
      it('should render explanatory text', async function() {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          campaignArchivedAt: '2020-01-03',
          assessmentState: 'started',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryPercentage: null,

        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Archived @model={{this.campaignParticipationOverview}} />`);

        // then
        expect(contains('My organization')).to.exist;
        expect(contains('My campaign')).to.exist;
        expect(contains('Parcours archivé par votre organisation.Vos résultats n\'ont pas pu être envoyés.')).to.exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.tag.archived'))).to.exist;
        expect(contains(this.intl.t('pages.campaign-participation-overview.card.started-at', { date: '01/01/2020' }))).to.exist;
      });
    });

    context('when the participation has a mastery percentage', ()=> {
      it('should render the result with percentage', async function() {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          campaignArchivedAt: '2020-01-03',
          assessmentState: 'completed',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryPercentage: 56,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Archived @model={{this.campaignParticipationOverview}} />`);

        // then

        expect(contains('56 % de réussite')).to.exist;
      });
    });

    context('when the campaign has stages', ()=> {
      it('should render the result with stars', async function() {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          createdAt: '2020-01-01',
          campaignArchivedAt: '2020-01-03',
          assessmentState: 'completed',
          campaignTitle: 'My campaign',
          organizationName: 'My organization',
          masteryPercentage: 56,
          totalStagesCount: 3,
          validatedStagesCount: 1,
        });

        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Archived @model={{campaignParticipationOverview}} />`);

        // then

        expect(contains('1 étoile sur 3')).to.exist;

      });
    });
  });
});
