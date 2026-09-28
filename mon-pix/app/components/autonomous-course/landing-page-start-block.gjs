import { PixButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';

export default class LandingPageStartBlock extends Component {
  @service pixMetrics;
  @service router;
  @service session;

  get isUserConnected() {
    return this.session.isAuthenticated;
  }

  @action
  async redirectToSignin() {
    const transition = this.args.startCampaignParticipation();
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  @action
  async startCampaignParticipationAsAnonymous() {
    this.pixMetrics.trackEvent('StartAutonomousCourseAsAnonymousClick');
    this.args.startCampaignParticipation();
  }

  <template>
    <section class="autonomous-course-landing-page-start-block rounded-panel">
      <div class="autonomous-course-landing-page-start-block__logos">
        <img src="/images/pix-logo.svg" alt="Pix" />
      </div>
      <h1 id="autonomous-course-main-title" class="autonomous-course-landing-page-start-block__title">
        {{t "pages.autonomous-course.landing-page.texts.title"}}<br />
        {{@campaign.title}}
      </h1>

      <div class="autonomous-course-landing-page-start-block__description">
        <MarkdownToHtml @markdown={{@campaign.customLandingPageText}} @isInline={{true}} />
      </div>

      {{#if this.isUserConnected}}
        <PixButton
          id="autonomous-course-connected-start-button"
          class="autonomous-course-landing-page-start-block__connected-start-button"
          @triggerAction={{@startCampaignParticipation}}
        >
          {{t "pages.autonomous-course.landing-page.actions.start-connected"}}
        </PixButton>
      {{else}}
        <div class="autonomous-course-landing-page-start-block__launcher">
          <p>{{t "pages.autonomous-course.landing-page.texts.first-course"}}</p>
          <PixButton
            id="autonomous-course-start-anonymously-button"
            class="start-anonymously-button"
            @triggerAction={{this.startCampaignParticipationAsAnonymous}}
          >
            {{t "pages.autonomous-course.landing-page.actions.start-anonymously"}}
          </PixButton>
          <p>{{t "common.or"}}</p>
          <button
            id="autonomous-course-sign-in-button"
            class="sign-in-button"
            type="button"
            {{on "click" this.redirectToSignin}}
          >
            {{t "pages.autonomous-course.landing-page.actions.sign-in"}}
          </button>
        </div>
      {{/if}}

      <p class="autonomous-course-landing-page-start-block__informations">
        {{t "pages.autonomous-course.landing-page.texts.legal-informations" htmlSafe=true}}
      </p>
    </section>
  </template>
}
