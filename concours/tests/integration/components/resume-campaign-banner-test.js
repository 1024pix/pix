import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | resume-campaign-banner', function() {

  setupRenderingTest();

  describe('Banner display', function() {
    const campaignToResume = EmberObject.create({
      isShared: false,
      createdAt: '2019-09-30T12:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
        title: 'Parcours Pix'
      })
    });
    const oldCampaignNotFinished = EmberObject.create({
      isShared: false,
      createdAt: '2019-09-30T10:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });
    const campaignFinished = EmberObject.create({
      isShared: true,
      createdAt: '2019-09-30T14:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
      }),
      assessment: EmberObject.create({
        isCompleted: true,
      }),
    });

    context('when campaign is not finished and not shared', function() {

      it('should display the resume campaign banner', async function() {
        // given
        this.set('campaignParticipations', [campaignToResume, oldCampaignNotFinished, campaignFinished]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
      });

      it('should display a link to resume the campaign', async function() {
        // given
        this.set('campaignParticipations', [campaignToResume]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__button')).to.exist;
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Reprendre');
      });

      it('should display a sentence to ask user to resume with the title of campaign', async function() {
        // given
        this.set('campaignParticipations', [campaignToResume]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__title')).to.exist;
        expect(find('.resume-campaign-banner__title').textContent).to.equal(`Vous n'avez pas terminé le parcours "${campaignToResume.campaign.title}"`);
      });

      it('should display a simple sentence to ask user to resume when campaign has no title', async function() {
        // given
        campaignToResume.campaign.set('title', null);
        this.set('campaignParticipations', [campaignToResume]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__title')).to.exist;
        expect(find('.resume-campaign-banner__title').textContent).to.equal('Vous n\'avez pas terminé votre parcours');
      });

    });

    context('when campaign is finished but not shared', function() {

      const campaignFinishedButNotShared = EmberObject.create({
        isShared: false,
        createdAt: '2019-09-30T10:30:00Z',
        campaign: EmberObject.create({
          code: 'AZERTY',
          title: 'Parcours Pix'
        }),
        assessment: EmberObject.create({
          isCompleted: true,
        }),
      });

      it('should display the resume campaign banner', async function() {
        // given
        this.set('campaignParticipations', [oldCampaignNotFinished, campaignFinished, campaignFinishedButNotShared]);
        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(find('.resume-campaign-banner__container')).to.exist;
      });

      it('should display a link to shared the results', async function() {
        // given
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__button')).to.exist;
        expect(find('.resume-campaign-banner__button').textContent).to.equal('Continuer');
      });

      it('should display a sentence to ask user to share his results with the title of campaign', async function() {
        // given
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__title')).to.exist;
        expect(find('.resume-campaign-banner__title').textContent).to.equal(`Parcours "${campaignFinishedButNotShared.campaign.title}" terminé ! Envoyez vos résultats.`);
      });

      it('should display a simple sentence to ask user to share his results when campaign has no title', async function() {
        // given
        campaignFinishedButNotShared.campaign.set('title', null);
        this.set('campaignParticipations', [campaignFinishedButNotShared]);

        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);

        // then
        expect(find('.resume-campaign-banner__title')).to.exist;
        expect(find('.resume-campaign-banner__title').textContent).to.equal('Parcours terminé ! Envoyez vos résultats.');
      });
    });

    context('when campaign is finished and shared', function() {

      it('should not display the resume campaign banner when the list of campaigns contains only finished campaign', async function() {
        // given
        this.set('campaignParticipations', [campaignFinished]);
        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(find('.resume-campaign-banner__container')).to.not.exist;
      });
    });

    context('when campaign is not started yet', function() {

      it('should not display the resume campaign banner when the list of campaigns is empty', async function() {
        // given
        this.set('campaignParticipations', []);
        // when
        await render(hbs`{{resume-campaign-banner campaignParticipations=campaignParticipations}}`);
        // then
        expect(find('.resume-campaign-banner__container')).to.not.exist;
      });
    });

  });

});
