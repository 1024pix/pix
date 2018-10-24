import { alias } from '@ember/object/computed';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import LinkComponent from '@ember/routing/link-component';
import EmberObject from '@ember/object';

describe('Integration | Component | resume-campaign-banner', function() {

  setupComponentTest('resume-campaign-banner', {
    integration: true
  });

  describe('Banner display', function() {
    const campaignToResume = EmberObject.create({
      isShared: false,
      createdAt: '2018-01-01',
      campaign: EmberObject.create({
        code: 'AZERTY',
        title: 'Parcours Pix'
      })
    });
    const oldCampaignNotFinished = EmberObject.create({
      isShared: false,
      createdAt: '2017-01-01',
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });
    const campaignFinish = EmberObject.create({
      isShared: true,
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });
    beforeEach(function() {
      LinkComponent.reopen({
        href: alias('qualifiedRouteName'),
      });
    });

    it('should display the resume campaign banner when list of campaigns contains a campaign not shared', function() {
      // given
      this.set('campaignParticipations', [campaignToResume, oldCampaignNotFinished, campaignFinish]);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(1);
    });

    it('should display a link to resume the campaign', function() {
      // given
      this.set('campaignParticipations', [campaignToResume]);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then

      expect(this.$('.resume-campaign-banner__button')).to.have.lengthOf(1);
      expect(this.$('.resume-campaign-banner__button').text()).to.equal('Reprendre');
      expect(this.$('.resume-campaign-banner__button').attr('href')).to.contains('campaigns.start-or-resume');
    });

    it('should show the title of campaign', function() {
      // given
      this.set('campaignParticipations', [campaignToResume]);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then

      expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
      expect(this.$('.resume-campaign-banner__title').text()).to.equal(`Vous n'avez pas terminé le parcours "${campaignToResume.campaign.title}"`);
    });

    it('should show a simple sentence when campaign has no title', function() {
      // given
      campaignToResume.campaign.set('title', null);
      this.set('campaignParticipations', [campaignToResume]);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then

      expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
      expect(this.$('.resume-campaign-banner__title').text()).to.equal('Vous n\'avez pas terminé votre parcours');
    });
    it('should not display the resume campaign banner when the list of campaigns is empty', function() {
      // given
      this.set('campaignParticipations', []);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(0);
    });

    it('should not display the resume campaign banner when the list of campaigns contains only finished campaign', function() {
      // given
      this.set('campaignParticipations', [campaignFinish]);
      // when
      this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(0);
    });

  });

});
