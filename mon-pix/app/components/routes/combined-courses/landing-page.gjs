import { PixButton } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

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
  </template>
}
