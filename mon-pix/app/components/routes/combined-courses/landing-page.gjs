import { PixButton, PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import Duration from 'mon-pix/components/combined-course/duration';
import ENV from 'mon-pix/config/environment';
import { escapeHtml } from 'mon-pix/utils/escape-html';

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
      firstName: escapeHtml(this.currentUser.user.firstName),
      lastName: escapeHtml(this.currentUser.user.lastName),
      htmlSafe: true,
    });
  }

  @action
  disconnect() {
    this.session.invalidate();
  }

  @action
  goToLogin() {
    this.router.transitionTo('organizations.access', this.args.combinedCourse.code, {
      queryParams: { authenticationRoute: 'login' },
    });
  }

  @action
  goToSignup() {
    this.router.transitionTo('organizations.access', this.args.combinedCourse.code);
  }

  @action
  startCombinedCourse() {
    this.router.transitionTo('organizations.access', this.args.combinedCourse.code);
  }

  <template>
    <div class="combined-course-landing">
      <nav class="combined-course-landing__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="close">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </nav>
      <main class="combined-course-landing__container">
        <header class="combined-course-landing__header">
          <LinkTo @route="authenticated.index" class="combined-course-landing__pix-logo--link">
            <img
              class="combined-course-landing__pix-logo--image"
              src="/images/pix-logo.svg"
              alt="{{t 'navigation.pix'}}"
            />
          </LinkTo>
          {{#unless (eq @combinedCourse.organizationId ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID)}}
            {{#if @combinedCourse.organizationLogoUrl}}
              <img
                class="combined-course-landing__partner-logo--image"
                src={{@combinedCourse.organizationLogoUrl}}
                alt={{@combinedCourse.organizationName}}
              />
            {{/if}}
          {{/unless}}
        </header>
        <MainSection
          @userIsAuthentified={{this.userIsAuthentified}}
          @combinedCourse={{@combinedCourse}}
          @goToLogin={{this.goToLogin}}
          @goToSignup={{this.goToSignup}}
          @currentUser={{this.currentUser}}
          @startCombinedCourse={{this.startCombinedCourse}}
        />
        <footer class="combined-course-landing__footer">
          {{#if this.userIsAuthentified}}
            <span>{{this.connectionMessage}}</span>
            <PixButton @variant="tertiary" @triggerAction={{this.disconnect}}>
              {{t "pages.campaign-landing.warning-message-logout"}}</PixButton>
          {{/if}}
        </footer>
      </main>
      <aside class="combined-course-landing__aside">
        <img class="combined-course-landing__aside--image" src="https://assets.pix.org/combined-courses/play.svg" />
      </aside>
    </div>
  </template>
}

const MainSection = <template>
  <div class="combined-course-landing-main">
    <section class="combined-course-landing-main__hero">
      {{#if @userIsAuthentified}}
        <h1>{{t "pages.campaign-landing.welcome-authenticated" firstName=@currentUser.user.firstName}}</h1>
      {{else}}
        <h1>{{t "pages.campaign-landing.welcome-unauthenticated"}}</h1>
      {{/if}}
      <h2>{{@combinedCourse.name}}</h2>
      <p class="combined-course-landing-main__hero--description">{{t
          "pages.campaign-landing.organization"
          organizationName=@combinedCourse.organizationName
        }}</p>
      <div class="combined-course-landing-main__hero--indicators">
        {{#if @combinedCourse.durationSpan}}
          <Duration @isCustomDurationFormat={{true}} @duration={{@combinedCourse.durationSpan}} />
        {{/if}}
        <dl>
          <dt><PixIcon @name="pauseCircle" /></dt>
          <dd>{{t "pages.campaign-landing.breaks-allowed"}}</dd>
        </dl>
        {{#if @combinedCourse.reward}}
          <dl>
            <dt><PixIcon @name="assignment" /></dt>
            <dd>{{t "pages.campaign-landing.has-reward"}}</dd>
          </dl>
        {{/if}}
      </div>
    </section>

    <section class="combined-course-landing-main__actions">
      <h2>{{t "pages.campaign-landing.actions.title"}}</h2>
      {{#if @userIsAuthentified}}
        <PixButton @triggerAction={{@startCombinedCourse}} class="combined-course-landing-main__actions--buttons">{{t
            "pages.campaign-landing.actions.start-cta"
          }}</PixButton>
      {{else}}
        <div class="combined-course-landing-main__actions--not-connected">
          <div class="combined-course-landing-main__actions--buttons">
            <PixButton @triggerAction={{@goToLogin}}>{{t "pages.campaign-landing.actions.login-cta"}}</PixButton>
            <PixButton @variant="secondary" @triggerAction={{@goToSignup}}>{{t
                "pages.campaign-landing.actions.signup-cta"
              }}</PixButton>
          </div>
          <p>{{t "pages.campaign-landing.login.info"}}</p>
        </div>
      {{/if}}
      <p class="combined-course-landing-main__actions--legal">{{t "pages.campaign-landing.actions.legal"}}</p>
    </section>
  </div>
</template>;
