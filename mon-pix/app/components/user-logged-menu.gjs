import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import t from 'ember-intl/helpers/t';
import onKey from 'ember-keyboard/modifiers/on-key';

export default class UserLoggedMenu extends Component {
  @service currentUser;
  @tracked canDisplayMenu = false;

  get showMyTestsLink() {
    return this.currentUser.user.hasAssessmentParticipations;
  }

  @action
  toggleUserMenu() {
    this.canDisplayMenu = !this.canDisplayMenu;
  }

  @action
  closeMenu() {
    this.canDisplayMenu = false;
  }

  @action
  handleTab() {
    /* `setTimeout(..., 0)` is used to wait the next browser rendering and get the new focused element */
    setTimeout(() => {
      if (!document.activeElement.classList.contains('logged-user-menu__link')) {
        this.closeMenu();
      }
    }, 0);
  }

  @action
  closeMenuOnPointerClick(event) {
    if (!event.pointerType || !event.target.closest('.logged-user-menu__link')) return;
    this.closeMenu();
  }

  <template>
    {{! template-lint-disable no-invalid-interactive }}
    <div class="logged-user-details">
      {{#if this.currentUser.user}}
        <button
          class="logged-user-name logged-user-name__link"
          type="button"
          aria-haspopup="true"
          aria-expanded="{{this.canDisplayMenu}}"
          {{on "click" this.toggleUserMenu}}
        >
          {{this.currentUser.user.firstName}}
          <span class="sr-only">{{t "navigation.user-logged-menu.details"}}</span>
          <span class="caret"></span>
        </button>

        {{#if this.canDisplayMenu}}
          <div
            class="logged-user-menu"
            {{onClickOutside this.closeMenu}}
            {{onKey "Escape" this.closeMenu}}
            {{onKey "Tab" this.handleTab}}
            {{on "click" this.closeMenuOnPointerClick}}
          >
            <div class="logged-user-menu__details">
              <div class="logged-user-menu-details__fullname">{{this.currentUser.user.fullName}}</div>
            </div>
            <ul class="logged-user-menu__actions">
              <li>
                <LinkTo @route="authenticated.user-account" class="logged-user-menu__link">
                  {{t "navigation.user.account"}}
                </LinkTo>
              </li>
              {{#if this.showMyTestsLink}}
                <li>
                  <LinkTo @route="authenticated.user-tests" class="logged-user-menu__link">
                    {{t "navigation.user.tests"}}
                  </LinkTo>
                </li>
              {{/if}}
              <li>
                <LinkTo @route="authenticated.user-certifications" class="logged-user-menu__link">
                  {{t "navigation.user.certifications"}}
                </LinkTo>
              </li>
              <li>
                <a
                  href="{{t 'navigation.main.link-help'}}"
                  target="_blank"
                  class="logged-user-menu__link"
                  rel="noopener noreferrer"
                >
                  {{t "navigation.main.help"}}
                </a>
              </li>
              <li>
                <LinkTo @route="logout" class="logged-user-menu__link">
                  <PixIcon @name="power" @ariaHidden={{true}} class="logged-user-menu__icon" />
                  {{t "navigation.user.sign-out"}}
                </LinkTo>
              </li>
            </ul>
          </div>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
