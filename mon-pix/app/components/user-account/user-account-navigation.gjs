import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { concat } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class UserAccountNavigationSection extends Component {
  @service currentDomain;

  get isOrgDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  <template>
    <nav role="navigation" class={{concat "user-account-navigation " @class}}>
      <ul>
        <li>
          <LinkTo @route="authenticated.user-account.personal-information" class="user-account-navigation__link">
            <PixIcon @name="userCircle" @ariaHidden={{true}} />
            {{t "pages.user-account.personal-information.menu-link-title"}}
          </LinkTo>
        </li>
        <li>
          <LinkTo @route="authenticated.user-account.connection-methods" class="user-account-navigation__link">
            <PixIcon @name="link" @ariaHidden={{true}} />
            {{t "pages.user-account.connexion-methods.menu-link-title"}}
          </LinkTo>
        </li>
        {{#if this.isOrgDomain}}
          <li>
            <LinkTo @route="authenticated.user-account.language" class="user-account-navigation__link">
              <PixIcon @name="language" @ariaHidden={{true}} />
              {{t "pages.user-account.language.menu-link-title"}}
            </LinkTo>
          </li>
        {{/if}}
        {{#if @canSelfDeleteAccount}}
          <li>
            <LinkTo
              @route="authenticated.user-account.delete-account"
              class="user-account-navigation__link user-account-navigation__link--important"
            >
              <PixIcon @name="delete" @ariaHidden={{true}} />
              {{t "pages.user-account.delete-account.menu-link-title"}}
            </LinkTo>
          </li>
        {{/if}}
      </ul>
    </nav>
  </template>
}
