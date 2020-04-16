import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | campaign-start-block template', function() {

  setupRenderingTest();

  it('should display all text arguments correctly', async function() {
    // given
    this.set('campaign', {});
    this.set('isLoading', false);
    this.set('startCampaignParticipation', () => {});
    this.set('titleText', 'title');
    this.set('announcementText', 'announcement');
    this.set('buttonText', 'button');
    this.set('legalText', 'legal');

    // when
    await render(hbs`
      <CampaignStartBlock
        @campaign={{this.campaign}}
        @isLoading={{this.isLoading}}
        @startCampaignParticipation={{this.startCampaignParticipation}}
        @titleText={{this.titleText}}
        @announcementText={{this.announcementText}}
        @buttonText={{this.buttonText}} 
        @legalText={{this.legalText}}
      />`);

    // then
    expect(find('.campaign-landing-page__start__text__title').textContent.trim()).to.equal('title');
    expect(find('.campaign-landing-page__start__text__announcement').textContent.trim()).to.equal('announcement');
    expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal('button');
    expect(find('.campaign-landing-page__start__text__legal').textContent.trim()).to.equal('legal');
  });

  it('should display display organization logo and landing page text', async function() {
    // given
    this.set('campaign', {
      organizationName: 'My organisation',
      organizationLogoUrl: 'http://orga.com/logo.png',
      customLandingPageText: 'My campaign text',
    });
    this.set('isLoading', false);
    this.set('startCampaignParticipation', () => {});
    this.set('titleText', 'title');
    this.set('announcementText', 'announcement');
    this.set('buttonText', 'button');
    this.set('legalText', 'legal');

    // when
    await render(hbs`
      <CampaignStartBlock
        @campaign={{this.campaign}}
        @isLoading={{this.isLoading}}
        @startCampaignParticipation={{this.startCampaignParticipation}}
        @titleText={{this.titleText}}
        @announcementText={{this.announcementText}}
        @buttonText={{this.buttonText}} 
        @legalText={{this.legalText}}
      />`);

    // then
    expect(find('.campaign-landing-page__logo .campaign-landing-page__image').getAttribute('src')).to.equal('http://orga.com/logo.png');
    expect(find('.campaign-landing-page__logo .campaign-landing-page__image').getAttribute('alt')).to.equal('My organisation');
    expect(find('.campaign-landing-page__start__custom-text').textContent).to.contain('My campaign text');
  });

  it('should display loading button when loading', async function() {
    // given
    this.set('campaign', {});
    this.set('isLoading', true);
    this.set('startCampaignParticipation', () => {});
    this.set('titleText', 'title');
    this.set('announcementText', 'announcement');
    this.set('buttonText', 'button');
    this.set('legalText', 'legal');

    // when
    await render(hbs`
      <CampaignStartBlock
        @campaign={{this.campaign}}
        @isLoading={{this.isLoading}}
        @startCampaignParticipation={{this.startCampaignParticipation}}
        @titleText={{this.titleText}}
        @announcementText={{this.announcementText}}
        @buttonText={{this.buttonText}} 
        @legalText={{this.legalText}}
      />`);

    // then
    expect(find('.loader-in-button')).to.exist;
  });
});
