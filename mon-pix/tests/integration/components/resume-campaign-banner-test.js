import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | resume-campaign-banner', function() {

  setupIntlRenderingTest();

  beforeEach(function() {
    this.intl.setLocale(['fr', 'fr']);
  });

  describe('Banner display', function() {
    const campaignToResume = EmberObject.create({
      isShared: false,
      createdAt: '2019-09-30T12:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
        title: 'Parcours Pix',
        isAssessment: true,
      }),
    });
    const oldCampaignNotFinished = EmberObject.create({
      isShared: false,
      createdAt: '2019-09-30T10:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
        isAssessment: true,
      }),
    });
    const campaignFinished = EmberObject.create({
      isShared: true,
      createdAt: '2019-09-30T14:30:00Z',
      campaign: EmberObject.create({
        code: 'AZERTY',
        isAssessment: true,
      }),
      assessment: EmberObject.create({
        isCompleted: true,
      }),
    });

    context('when campaign has type assessment', function() {

      context('when campaign is not finished and not shared', function() {

        it('should display the resume campaign banner', async function() {
          // given
          this.set('campaignParticipations', [campaignToResume, oldCampaignNotFinished, campaignFinished]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__container')).to.exist;
        });

        it('should display a link to resume the campaign', async function() {
          // given
          this.set('campaignParticipations', [campaignToResume]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);
          const a11yText = find('.resume-campaign-banner__button').firstChild.textContent;
          const buttonTextContent = find('.resume-campaign-banner__button').lastChild.textContent;

          // then
          expect(a11yText).to.equal(this.intl.t('pages.profile.resume-campaign-banner.accessibility.resume'));
          expect(buttonTextContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.actions.resume'));
        });

        it('should display a sentence to ask user to resume with the title of campaign', async function() {
          // given
          this.set('campaignParticipations', [campaignToResume]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__title').textContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.reminder-continue-campaign-with-title', { title: campaignToResume.campaign.title }));
        });

        it('should display a simple sentence to ask user to resume when campaign has no title', async function() {
          // given
          campaignToResume.campaign.set('title', null);
          this.set('campaignParticipations', [campaignToResume]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__title').textContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.reminder-continue-campaign'));
        });

      });

      context('when campaign is finished but not shared', function() {

        const campaignFinishedButNotShared = EmberObject.create({
          isShared: false,
          createdAt: '2019-09-30T10:30:00Z',
          campaign: EmberObject.create({
            code: 'AZERTY',
            title: 'Parcours Pix',
            isAssessment: true,
          }),
          assessment: EmberObject.create({
            isCompleted: true,
          }),
        });

        it('should display the resume campaign banner', async function() {
          // given
          this.set('campaignParticipations', [oldCampaignNotFinished, campaignFinished, campaignFinishedButNotShared]);
          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);
          // then
          expect(find('.resume-campaign-banner__container')).to.exist;
        });

        it('should display a link to shared the results', async function() {
          // given
          this.set('campaignParticipations', [campaignFinishedButNotShared]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);
          const a11yText = find('.resume-campaign-banner__button').firstChild.textContent;
          const buttonTextContent = find('.resume-campaign-banner__button').lastChild.textContent;

          // then
          expect(a11yText).to.equal(this.intl.t('pages.profile.resume-campaign-banner.accessibility.share'));
          expect(buttonTextContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.actions.continue'));
        });

        it('should display a sentence to ask user to share his results with the title of campaign', async function() {
          // given
          this.set('campaignParticipations', [campaignFinishedButNotShared]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__title').textContent).to.equal(`Parcours "${campaignFinishedButNotShared.campaign.title}" terminé. N'oubliez pas de finaliser votre envoi !`);
        });

        it('should display a simple sentence to ask user to share his results when campaign has no title', async function() {
          // given
          campaignFinishedButNotShared.campaign.set('title', null);
          this.set('campaignParticipations', [campaignFinishedButNotShared]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__title').textContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.reminder-send-campaign'));
        });
      });

      context('when campaign is finished and shared', function() {

        it('should not display the resume campaign banner when the list of campaigns contains only finished campaign', async function() {
          // given
          this.set('campaignParticipations', [campaignFinished]);
          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);
          // then
          expect(find('.resume-campaign-banner__container')).to.not.exist;
        });
      });

    });

    context('when campaign is not started yet', function() {

      it('should not display the resume campaign banner when the list of campaigns is empty', async function() {
        // given
        this.set('campaignParticipations', []);
        // when
        await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);
        // then
        expect(find('.resume-campaign-banner__container')).to.not.exist;
      });
    });

    context('when campaign has type collect profiles', function() {
      context('when campaign is not shared', function() {

        const campaignCollectNotShared = EmberObject.create({
          isShared: false,
          createdAt: '2019-09-30T14:30:00Z',
          campaign: EmberObject.create({
            code: 'AZERTY',
            isAssessment: false,
          }),
        });

        it('should display the resume campaign banner', async function() {
          // given
          this.set('campaignParticipations', [campaignCollectNotShared]);

          // when
          await render(hbs`<ResumeCampaignBanner @campaignParticipations={{campaignParticipations}} />`);

          // then
          expect(find('.resume-campaign-banner__title').textContent).to.equal(this.intl.t('pages.profile.resume-campaign-banner.reminder-send-campaign'));
        });
      });
    });

  });

});
