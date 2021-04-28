import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import { contains } from '../../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card | Ended', function() {
  setupIntlRenderingTest();
  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });
  describe('when card has "ENDED" status', function() {
    it('should render card info ', async function() {
      // given
      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: true,
        createdAt: '2020-12-10T15:16:20.109Z',
        sharedAt: '2020-12-18T15:16:20.109Z',
        assessmentState: 'completed',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });
      this.set('campaignParticipationOverview', campaignParticipationOverview);

      // when
      await render(hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`);

      // then
      expect(contains('My organization')).to.exist;
      expect(contains('My campaign')).to.exist;
      expect(contains(this.intl.t('pages.campaign-participation-overview.card.tag.finished'))).to.exist;
      expect(contains(this.intl.t('pages.campaign-participation-overview.card.see-more'))).to.exist;
      expect(contains(this.intl.t('pages.campaign-participation-overview.card.finished-at', { date: '18/12/2020' }))).to.exist;
    });

    context('when the campaign has no stages', function() {
      it('should render the result with percentage', async function() {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          assessmentState: 'completed',
          campaignTitle: 'My campaign',
          masteryPercentage: 20,
          totalStagesCount: 0,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`);

        // then
        expect(contains('20 % de réussite')).to.exist;
      });
    });

    context('when the campaign has stages', function() {
      it('should render the result with percentage', async function() {
        // given
        const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
          isShared: true,
          createdAt: '2020-12-10T15:16:20.109Z',
          sharedAt: '2020-12-18T15:16:20.109Z',
          assessmentState: 'completed',
          campaignTitle: 'My campaign',
          masteryPercentage: 70,
          validatedStagesCount: 4,
          totalStagesCount: 6,
        });
        this.set('campaignParticipationOverview', campaignParticipationOverview);

        // when
        await render(hbs`<CampaignParticipationOverview::Card::Ended @model={{this.campaignParticipationOverview}} />`);

        // then
        expect(contains('4 étoiles sur 6')).to.exist;
      });
    });
  });
});
