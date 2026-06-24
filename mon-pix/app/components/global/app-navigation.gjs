import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';
import PixNavigationButton from '@1024pix/pix-ui/components/pix-navigation-button';
import PixNavigationSeparator from '@1024pix/pix-ui/components/pix-navigation-separator';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import PixLogo from '../pix-logo';

export default class AppNavigation extends Component {
  @service currentDomain;
  @service currentUser;
  @service media;
  @service store;
  @service url;

  @tracked _hasAttestations = false;

  constructor(owner, args) {
    super(owner, args);
    if (!this.currentUser.user) return;

    const cacheKey = `pix-has-attestations-${this.currentUser.user.id}`;
    if (localStorage.getItem(cacheKey) === 'true') {
      this._hasAttestations = true;
      return;
    }

    this._loadAttestationVisibility(cacheKey);
  }

  async _loadAttestationVisibility(cacheKey) {
    try {
      const attestations = await this.store.findAll('attestation-detail');
      if (attestations.length > 0) {
        localStorage.setItem(cacheKey, 'true');
        this._hasAttestations = true;
      }
    } catch {
      // silently fail — don't show the link
    }
  }

  get showAssessmentsNavItem() {
    return this.currentUser.user.hasAssessmentParticipations;
  }

  get showTrainingsNavItem() {
    return this.currentUser.user.hasRecommendedTrainings;
  }

  get showAttestationNavItem() {
    return this._hasAttestations;
  }

  <template>
    <PixNavigation
      class="app-navigation"
      @navigationAriaLabel={{t "navigation.nav-bar.aria-label"}}
      @openLabel={{t "navigation.nav-bar.open"}}
      @closeLabel={{t "navigation.nav-bar.close"}}
    >
      <:brand>
        <PixLogo @color="white" />
      </:brand>
      <:navElements>
        {{#if this.currentUser.user}}
          <PixNavigationButton @route="authenticated.user-dashboard" @icon="home">
            {{t "navigation.main.dashboard"}}
          </PixNavigationButton>
          <PixNavigationButton @route="authenticated.profile" @icon="star">
            {{t "navigation.main.skills"}}
          </PixNavigationButton>
          {{#if this.showAssessmentsNavItem}}
            <PixNavigationButton @route="authenticated.user-tests" @icon="conversionPath">
              {{t "navigation.user.tests"}}
            </PixNavigationButton>
          {{/if}}
          <PixNavigationButton @route="authenticated.certifications" @icon="newRealease">
            {{t "navigation.main.start-certification"}}
          </PixNavigationButton>
          {{#if this.showAttestationNavItem}}
            <PixNavigationButton @route="authenticated.attestations" @icon="awards">
              {{t "navigation.main.attestations"}}
            </PixNavigationButton>
          {{/if}}
          {{#if this.showTrainingsNavItem}}
            <PixNavigationButton @route="authenticated.user-trainings" @icon="book">
              {{t "navigation.main.trainings"}}
            </PixNavigationButton>
          {{/if}}
          <PixNavigationButton @route="authenticated.user-tutorials" @icon="bookmark">
            {{t "navigation.main.tutorials"}}
          </PixNavigationButton>
        {{else}}
          <PixButtonLink @route="authentication.login" @variant="primary-bis" @iconBefore="login">
            {{t "navigation.not-logged.sign-in"}}
          </PixButtonLink>
          <PixButtonLink @route="inscription" @variant="primary">
            {{t "navigation.not-logged.sign-up"}}
          </PixButtonLink>
        {{/if}}
      </:navElements>
      <:footer>
        {{#if this.media.isMobile}}
          <PixButtonLink
            class="app-main-header__campaign-code-button"
            @route="fill-in-campaign-code"
            title={{t "pages.fill-in-campaign-code.start"}}
            @iconBefore="codeNumber"
          >
            {{t "navigation.main.code"}}
          </PixButtonLink>
          <PixNavigationSeparator />
          <strong>{{this.currentUser.user.fullName}}</strong>
          <PixButtonLink @route="authenticated.user-certifications" @variant="tertiary" @iconBefore="awards">
            {{t "navigation.user.certifications"}}
          </PixButtonLink>
          <PixButtonLink @route="authenticated.user-account" @iconBefore="shieldPerson">
            {{t "navigation.user.account"}}
          </PixButtonLink>
          <PixButtonLink @route="logout" @variant="secondary" @iconBefore="power">
            {{t "navigation.user.sign-out"}}
          </PixButtonLink>
          <PixNavigationSeparator />
        {{/if}}
        <PixButtonLink href={{this.url.supportHomeUrl}} target="_blank" @variant="tertiary" @iconBefore="help">
          {{t "navigation.footer.help-center"}}
        </PixButtonLink>
      </:footer>
    </PixNavigation>
  </template>
}
