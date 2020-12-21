import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import times from 'lodash/times';
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
        campaign: { title: 'My campaign 1', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 2', isTypeAssessment: true },
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

  it('should filter campaign participation with campaign type profile collection', async function() {
    // given
    const campaignParticipations = [
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 1', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 2', isTypeProfilesCollection: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 3', isTypeAssessment: true },
      }),
    ];
    this.set('campaignParticipations', campaignParticipations);

    // when
    await render(hbs`<CampaignParticipation::Grid @model={{campaignParticipations}} />}`);

    // then
    expect(findAll('.campaign-participation-grid-item').length).to.equal(2);
  });

  it('should filter already shared campaign participation', async function() {
    // given
    const campaignParticipations = [
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: true,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 1', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: false,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 2', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: true,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 3', isTypeAssessment: true },
      }),
    ];
    this.set('campaignParticipations', campaignParticipations);

    // when
    await render(hbs`<CampaignParticipation::Grid @model={{campaignParticipations}} />}`);

    // then
    expect(findAll('.campaign-participation-grid-item').length).to.equal(1);
  });

  it('should filter campaign participations with different conditions', async function() {
    // given
    const campaignParticipations = [
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: true,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 1', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: false,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 2', isTypeAssessment: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: true,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 3', isTypeProfilesCollection: true },
      }),
      EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        isShared: false,
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: 'My campaign 4', isTypeProfilesCollection: true },
      }),
    ];
    this.set('campaignParticipations', campaignParticipations);

    // when
    await render(hbs`<CampaignParticipation::Grid @model={{campaignParticipations}} />}`);

    // then
    expect(findAll('.campaign-participation-grid-item').length).to.equal(1);
    const participationCardTitles = findAll('.campaign-participation-card-header__title');
    expect(participationCardTitles[0].textContent).to.equal('My campaign 2');
  });

  it('should render up to 9 cards', async function() {
    // given
    const campaignParticipations = times(10, (index) => {
      return EmberObject.create({
        createdAt: '2020-12-10T15:16:20.109Z',
        assessment: EmberObject.create({ isCompleted: false, state: 'started' }),
        campaign: { title: `My campaign ${index}`, isTypeAssessment: true },
      });
    });
    this.set('campaignParticipations', campaignParticipations);

    // when
    await render(hbs`<CampaignParticipation::Grid @model={{campaignParticipations}} />}`);

    // then
    expect(findAll('.campaign-participation-grid-item').length).to.equal(9);
  });
});
