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
            isProfilesCollection: true,
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
