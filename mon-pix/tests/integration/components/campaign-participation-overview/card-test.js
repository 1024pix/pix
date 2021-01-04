import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipationOverview | Card', function() {
  setupIntlRenderingTest();

  it('should render component with a started state', async function() {
    // given
    const campaignParticipationOverview = EmberObject.create({
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      assessmentState: 'started',
      campaignTitle: 'My campaign',
    });
    this.set('campaignParticipationOverview', campaignParticipationOverview);

    // when
    await render(hbs`<CampaignParticipationOverview::Card @model={{campaignParticipationOverview}} />}`);

    // then
    expect(find('h1').textContent).to.equal('My campaign');
    expect(find('.campaign-participation-overview-card-header__tag')).to.exist;
    expect(find('.campaign-participation-overview-card-header__tag').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation-overview.card.tag.started'));
    expect(find('time').getAttribute('datetime')).to.equal('2020-12-10T15:16:20.109Z');
    expect(find('a').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation-overview.card.resume'));
  });

  it('should render component with a completed state but not shared', async function() {
    // given
    const campaignParticipationOverview = EmberObject.create({
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      assessmentState: 'completed',
      campaignTitle: 'My campaign',
    });
    this.set('campaignParticipationOverview', campaignParticipationOverview);

    // when
    await render(hbs`<CampaignParticipationOverview::Card @model={{campaignParticipationOverview}} />}`);

    // then
    expect(find('.campaign-participation-overview-card-header__tag').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation-overview.card.tag.completed'));
    expect(find('a').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation-overview.card.send'));
  });
});
