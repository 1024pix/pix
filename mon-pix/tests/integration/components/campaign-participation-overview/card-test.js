import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import { contains } from '../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card', function() {
  setupIntlRenderingTest();
  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });
  context('when the participation status is ONGOING', function() {
    it('should display CardOngoing', async function() {

      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      await render(hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`);
      expect(contains('En cours')).to.exist;
    });
  });

  context('when the participation status is TO_SHARE', function() {
    it('should display CardToShare', async function() {

      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'completed',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      await render(hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`);
      expect(contains('À envoyer')).to.exist;
    });
  });

  context('when the participation status is ENDED', function() {
    it('should display CardEnded', async function() {

      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: true,
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'completed',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
        masteryPercentage: 20,
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      await render(hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`);
      expect(contains('Terminé')).to.exist;
    });
  });

  context('when the participation status is ARCHIVED', function() {
    it('should display CardArchived', async function() {

      const campaignParticipationOverview = store.createRecord('campaign-participation-overview', {
        isShared: false,
        createdAt: '2020-12-18T15:16:20.109Z',
        campaignArchivedAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });

      this.set('campaignParticipationOverview', campaignParticipationOverview);

      await render(hbs`<CampaignParticipationOverview::Card @model={{this.campaignParticipationOverview}} />}`);
      expect(contains('Archivé')).to.exist;
    });
  });
});
