import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipation | Grid', function() {
  setupIntlRenderingTest();

  it('should render component', async function() {
    // when
    await render(hbs`<CampaignParticipation::Grid />}`);

    // then
    expect(find('.campaign-participation-grid')).to.exist;
  });

  it('should display campaign participation items', async function() {
    // given
    const campaignParticipations = [
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 1', isAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 2', isAssessment: true },
      }),
    ];
    this.set('campaignParticipations', campaignParticipations);

    // when
    await render(hbs`<CampaignParticipation::Grid @model={{campaignParticipations}} />}`);

    // then
    expect(findAll('.campaign-participation-grid-item').length).to.equal(2);
    const participationCardTitles = findAll('.campaign-participation-card-header__title');
    expect(participationCardTitles[0].textContent).to.equal('My campaign 1');
    expect(participationCardTitles[1].textContent).to.equal('My campaign 2');
  });
});
