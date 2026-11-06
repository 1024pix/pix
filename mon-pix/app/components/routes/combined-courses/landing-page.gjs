import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Duration from 'mon-pix/components/combined-course/duration';

const dataForPage = {
  partnerUrl: 'https://test.com',
  partnerAlt: 'logo de partner',
  partnerLogoUrl: 'https://assets.pix.org/test/comportement-lapin-768x644-1.png',
  combinedCourse: {
    name: 'Mon Combined Course',
    durationSpan: 'short',
    reward: true,
  },
  organizationToJoin: {
    name: 'orga',
  },
};

export default class CombinedCourseLandingPage extends Component {
  @service currentUser;
  @service session;
  @service intl;
  @service store;
  @service router;

  get userIsAuthentified() {
    return this.session.isAuthenticated;
  }

  get connectionMessage() {
    return this.intl.t(`pages.campaign-landing.warning-message`, {
      firstName: this.currentUser.user.firstName,
      lastName: this.currentUser.user.lastName,
      htmlSafe: true,
    });
  }

  @action
  disconnect() {
    this.session.invalidate();
  }

  @action
  goToLogin() {
    const identityProviderToVisit = null;

    //until we complete the ticket, we need to redirect in all cases to authentication.login
    if (!identityProviderToVisit) {
      return this.router.transitionTo('authentication.login');
    } else {
      //todo: modify when branching routes to pass the code
      return this.router.transitionTo('organizations.access', 'SCOMBINIX');
    }
  }

  @action
  goToSignup() {
    return this.router.transitionTo('organizations.access', 'SCOMBINIX');
  }

  <template>
    <header class="combined-course-landing__header">
      <LinkTo @route="authenticated.index" class="combined-course-landing__pix-logo--link">
        <img class="combined-course-landing__pix-logo--image" src="/images/pix-logo.svg" alt="{{t 'navigation.pix'}}" />
      </LinkTo>
      <a href={{dataForPage.partnerUrl}} class="combined-course-landing__partner-logo--link">
        <img
          class="combined-course-landing__partner-logo--image"
          src={{dataForPage.partnerLogoUrl}}
          alt={{dataForPage.partnerAlt}}
        />
      </a>
    </header>

    <main class="combined-course-landing__main">
      <div class="combined-course-landing__title">
        {{#if this.userIsAuthentified}}
          <h1>{{t "pages.campaign-landing.welcome-unauthenticated" firstName=this.currentUser.firstName}}</h1>
        {{else}}
          <h1>{{t "pages.campaign-landing.welcome-unauthenticated"}}</h1>
        {{/if}}
        <h2>{{dataForPage.combinedCourse.name}}</h2>
        <p>{{t "pages.campaign-landing.organization" organizationName=dataForPage.organizationToJoin.name}}</p>
        <div class="combined-course-landing__indicators">
          <Duration @isCustomDurationFormat={{true}} @duration={{dataForPage.combinedCourse.durationSpan}} />
          <dl>
            <dt><PixIcon @name="pauseCircle" /></dt>
            <dd>{{t "pages.campaign-landing.breaks"}}</dd>
          </dl>
          {{#if dataForPage.combinedCourse.reward}}
            <dl>
              <dt><PixIcon @name="assignment" /></dt>
              <dd>{{t "pages.campaign-landing.has-reward"}}</dd>
            </dl>
          {{/if}}
        </div>
      </div>
      {{#if this.userIsAuthentified}}
        <div class="combined-course-landing__connection">
          <span>{{this.connectionMessage}}</span>
          <a href="#" class="link" {{on "click" this.disconnect}}>
            {{t "pages.campaign-landing.warning-message-logout"}}
          </a>
        </div>
      {{else}}
        <div class="combined-course-landing__login">
          <div class="combined-course-landing__login-actions">
            <PixButton @triggerAction={{this.goToLogin}}>{{t "pages.campaign-landing.login.login-cta"}}</PixButton>
            <PixButton @variant="secondary" @triggerAction={{this.goToSignup}}>{{t
                "pages.campaign-landing.login.signup-cta"
              }}</PixButton>
          </div>
          <p class="combined-course-landing__login-info">{{t "pages.campaign-landing.login.info"}}</p>
        </div>
      {{/if}}
    </main>
  </template>
}
