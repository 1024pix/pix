import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Grid', function() {
  setupIntlRenderingTest();
  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('should render component', async function() {
    // when
    await render(hbs`<CampaignParticipationOverview::Grid />}`);

    // then
    expect(find('.campaign-participation-overview-grid')).to.exist;
  });

  it('should render campaign participation overview items', async function() {
    // given
    const campaignParticipationOverviews = [
      store.createRecord('campaign-participation-overview', {
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign 1',
      }),
      store.createRecord('campaign-participation-overview', {
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign 2',
      }),
    ];
    this.set('campaignParticipationOverviews', campaignParticipationOverviews);

    // when
    await render(hbs`<CampaignParticipationOverview::Grid @model={{this.campaignParticipationOverviews}} />}`);

    // then
    expect(findAll('.campaign-participation-overview-grid__item').length).to.equal(2);
    const participationCardSubtitles = findAll('.campaign-participation-overview-card-header__subtitle');
    expect(participationCardSubtitles[0].textContent).to.equal('My campaign 1');
    expect(participationCardSubtitles[1].textContent).to.equal('My campaign 2');
  });
});
