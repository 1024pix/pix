import { PixButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CampaignLandingPageDetails from 'mon-pix/components/campaign-landing-page-details';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';

export default class CampaignStartBlock extends Component {
  <template>
    <div class="rounded-panel campaign-landing-page__container__start">
      <div class="campaign-landing-page__start__image__container">
        <div class="campaign-landing-page__pix-logo">
          <img class="campaign-landing-page__image" src="/images/pix-logo.svg" alt="Pix" />
          {{#if @campaign.organizationLogoUrl}}
            <div data-test-id="campaign-landing-page__logo">
              <img
                class="campaign-landing-page__image"
                src="{{@campaign.organizationLogoUrl}}"
                alt="{{@campaign.organizationName}}"
              />
            </div>
          {{/if}}
        </div>
      </div>

      <form {{on "submit" this.start}}>
        <div class="campaign-landing-page-start">
          <h1 class="campaign-landing-page-start__title">{{this.titleText}}</h1>
          {{#unless this.session.isAuthenticated}}
            <h2 class="campaign-landing-page-start__subtitle">{{this.announcementText}}</h2>
          {{/unless}}
          {{#if this.showExamCampaignInfo}}
            <p class="campaign-landing-page-detail__exam-notice">{{t
                "pages.campaign-landing.assessment.exam-notice"
              }}</p>
          {{/if}}
          <PixButton
            @type="submit"
            class="campaign-landing-page__start-button"
            @loading-color="white"
            @size="large"
          >{{this.buttonText}}</PixButton>
          {{#if @campaign.isAssessment}}
            <CampaignLandingPageDetails />
          {{/if}}
          <p class="campaign-landing-page-start__legal">{{this.legalText}}</p>
        </div>
      </form>

      {{#if this.showWarningMessage}}
        <div class="campaign-landing-page__start__warning">
          <span>{{this.warningMessage}}</span>
          <a href="#" class="link" {{on "click" this.disconnect}}>
            {{t "pages.campaign-landing.warning-message-logout"}}
          </a>
        </div>
      {{/if}}

      {{#if @campaign.customLandingPageText}}
        <div class="campaign-landing-page__start__custom-text">
          <MarkdownToHtml @markdown={{@campaign.customLandingPageText}} />
        </div>
      {{/if}}
    </div>
  </template>
  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service pixMetrics;

  get showWarningMessage() {
    return this.session.isAuthenticated && !this.currentUser.user.isAnonymous;
  }

  get campaignType() {
    return this.args.campaign.isAssessment || this.args.campaign.isExam ? 'assessment' : 'profiles-collection';
  }

  get showExamCampaignInfo() {
    return this.args.campaign.isExam;
  }

  get titleText() {
    if (this.showWarningMessage) {
      return this.intl.t(`pages.campaign-landing.${this.campaignType}.title-with-username`, {
        userFirstName: this.currentUser.user.firstName,
        htmlSafe: true,
      });
    } else {
      return this.intl.t(`pages.campaign-landing.${this.campaignType}.title`, {
        htmlSafe: true,
      });
    }
  }

  get buttonText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.action`);
  }

  get announcementText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.announcement`);
  }

  get legalText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.legal`);
  }

  get warningMessage() {
    return this.intl.t('pages.campaign-landing.warning-message', {
      firstName: this.currentUser.user.firstName,
      lastName: this.currentUser.user.lastName,
    });
  }

  @action
  trackAccessForUser() {
    if (this.args.campaign.isSimplifiedAccess && !this.session.isAuthenticated) {
      this.pixMetrics.trackEvent('StartSimplifiedAccessCampaignAsAnonymousClick');
    }
  }

  @action
  disconnect() {
    this.session.invalidate();
  }

  @action
  start(event) {
    event.preventDefault();
    this.trackAccessForUser();
    this.args.startCampaignParticipation();
  }
}
