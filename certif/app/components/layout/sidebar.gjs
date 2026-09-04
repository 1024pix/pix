import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';
import PixNavigationButton from '@1024pix/pix-ui/components/pix-navigation-button';
import PixStructureSwitcher from '@1024pix/pix-ui/components/pix-structure-switcher';
import { action } from '@ember/object';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Sidebar extends Component {
  @service url;
  @service currentUser;
  @service router;

  get showLinkToSessions() {
    return !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted;
  }

  get userFullName() {
    const certificationPointOfContact = this.currentUser.certificationPointOfContact;
    return `${certificationPointOfContact.firstName} ${certificationPointOfContact.lastName}`;
  }

  get currentAllowedCertificationCenterAccess() {
    return this.currentUser.currentAllowedCertificationCenterAccess;
  }

  get certificationCenterNameAndExternalId() {
    if (this.currentAllowedCertificationCenterAccess.externalId) {
      return `${this.currentAllowedCertificationCenterAccess.name} (${this.currentAllowedCertificationCenterAccess.externalId})`;
    }
    return this.currentAllowedCertificationCenterAccess.name;
  }

  get hasMultipleCertificationCenterAccesses() {
    return this.currentUser.certificationPointOfContact.allowedCertificationCenterAccesses.length > 1;
  }

  get allowedCertificationCenterAccesses() {
    return this.currentUser.certificationPointOfContact.allowedCertificationCenterAccesses
      .map(({ name, externalId, id }) => ({ label: externalId ? `${name} (${externalId})` : name, value: id }))
      .sort((a, b) => {
        return a.name?.localeCompare(b.name);
      });
  }

  @action
  async changeCurrentCertificationCenterAccess(options) {
    this.currentUser.updateCurrentCertificationCenter(options.value);
    this.router.replaceWith('authenticated');
  }

  <template>
    <PixNavigation
      @texts={{hash
        mainNavigation=(t "navigation.sidebar.extra-information")
        openMenu=(t "navigation.sidebar.menu-labels.open")
        closeMenu=(t "navigation.sidebar.menu-labels.open")
      }}
    >
      <:brand>
        <LinkTo @route='authenticated'>
          <img src='/certif-logo.svg' alt={{t 'common.home-page'}} />
        </LinkTo>
      </:brand>
      <:navElements>
        <ul>
          {{#if this.showLinkToSessions}}
            <li>
              <PixNavigationButton
                @route='authenticated.sessions'
                @icon='session'
                @ariaHidden={{true}}
                aria-label={{t 'navigation.sidebar.sessions.extra-information'}}
              >
                {{t 'navigation.sidebar.sessions.label'}}
              </PixNavigationButton>
            </li>
            <li>
              <PixNavigationButton @route='login-session-invigilator' @icon='eye' @ariaHidden={{true}} @target='_blank'>
                {{t 'navigation.sidebar.invigilator'}}
              </PixNavigationButton>
            </li>
          {{/if}}
          <li>
            <PixNavigationButton @route='authenticated.team' @icon='users' @plainIcon={{true}} @ariaHidden={{true}}>
              {{t 'navigation.sidebar.team'}}
            </PixNavigationButton>
          </li>
          <li>
            <PixNavigationButton
              href={{this.url.documentationUrl}}
              @icon='book'
              @title='Documentation'
              @target='_blank'
              @newWindowLabel={{t 'navigation.external-link-title'}}
            >
              {{t 'navigation.sidebar.documentation'}}
            </PixNavigationButton>
          </li>
        </ul>
      </:navElements>
      <:footer>

        <p class='sidebar-footer__full-name'>{{this.userFullName}}</p>
        <p>{{this.certificationCenterNameAndExternalId}}</p>

        {{#if this.hasMultipleCertificationCenterAccesses}}
          <PixStructureSwitcher
            @label={{t 'navigation.sidebar.change-center.label'}}
            @structures={{this.allowedCertificationCenterAccesses}}
            @value={{this.currentUser.currentAllowedCertificationCenterAccess.id}}
            @onChange={{this.changeCurrentCertificationCenterAccess}}
          />
        {{/if}}

        <PixButtonLink @route='logout' @variant='tertiary'>
          {{t 'navigation.sidebar.logout'}}
        </PixButtonLink>
      </:footer>
    </PixNavigation>
  </template>
}
