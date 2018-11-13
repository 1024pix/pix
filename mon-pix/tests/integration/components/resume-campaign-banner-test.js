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
      campaign: EmberObject.create({
        code: 'AZERTY',
        title: 'Parcours Pix'
      })
    });
    const oldCampaignNotFinished = EmberObject.create({
      isShared: false,
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });
    const campaignFinished = EmberObject.create({
      isShared: true,
      campaign: EmberObject.create({
        code: 'AZERTY',
      }),
      assessment: EmberObject.create({
        isCompleted: true,
      }),
    });
    beforeEach(function() {
      LinkComponent.reopen({
        href: alias('qualifiedRouteName'),
      });
    });

    context('when campaign is not finished and not shared', function() {

      it('should display the resume campaign banner', function() {
        // given
        this.set('campaignParticipations', [campaignToResume, oldCampaignNotFinished, campaignFinished]);

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

      it('should display a sentence to ask user to resume with the title of campaign', function() {
        // given
        this.set('campaignParticipations', [campaignToResume]);

        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
        expect(this.$('.resume-campaign-banner__title').text()).to.equal(`Vous n'avez pas terminé le parcours "${campaignToResume.campaign.title}"`);
      });

      it('should display a simple sentence to ask user to resume when campaign has no title', function() {
        // given
        campaignToResume.campaign.set('title', null);
        this.set('campaignParticipations', [campaignToResume]);

        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
        expect(this.$('.resume-campaign-banner__title').text()).to.equal('Vous n\'avez pas terminé votre parcours');
      });

    });

    context('when campaign is finished but not shared', function() {

      const campaignFinishedButNotShared = EmberObject.create({
        isShared: false,
        campaign: EmberObject.create({
          code: 'AZERTY',
          title: 'Parcours Pix'
        }),
        assessment: EmberObject.create({
          isCompleted: true,
        }),
      });

      it('should display the resume campaign banner', function() {
        // given
        this.set('campaignParticipations', [oldCampaignNotFinished, campaignFinished, campaignFinishedButNotShared]);
        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(1);
      });

      it('should display a link to shared the results', function() {
        // given
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(this.$('.resume-campaign-banner__button')).to.have.lengthOf(1);
        expect(this.$('.resume-campaign-banner__button').text()).to.equal('Continuer');
        expect(this.$('.resume-campaign-banner__button').attr('href')).to.contains('campaigns.start-or-resume');
      });

      it('should display a sentence to ask user to share his results with the title of campaign', function() {
        // given
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
        expect(this.$('.resume-campaign-banner__title').text()).to.equal(`Parcours "${campaignFinishedButNotShared.campaign.title}" terminé ! Envoyez vos résultats.`);
      });

      it('should display a simple sentence to ask user to share his results when campaign has no title', function() {
        // given
        campaignFinishedButNotShared.campaign.set('title', null);
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(this.$('.resume-campaign-banner__title')).to.have.lengthOf(1);
        expect(this.$('.resume-campaign-banner__title').text()).to.equal('Parcours terminé ! Envoyez vos résultats.');
      });
    });

    context('when campaign is finished and shared', function() {

      it('should not display the resume campaign banner when the list of campaigns contains only finished campaign', function() {
        // given
        this.set('campaignParticipations', [campaignFinished]);
        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(0);
      });
    });

    context('when campaign is not started yet', function() {

      it('should not display the resume campaign banner when the list of campaigns is empty', function() {
        // given
        this.set('campaignParticipations', []);
        // when
        this.render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(0);
      });
    });

  });

});
