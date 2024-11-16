import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

export default class Sidebar extends Component {
  @service currentUser;

  get documentationLink() {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents) {
      return LINK_SCO;
    }
    return LINK_OTHER;
  }

  get showLinkToSessions() {
    return !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted;
  }

  <template>
    <aside class='app__sidebar sidebar'>
      <header class='sidebar__logo'>
        <LinkTo @route='authenticated'>
          <img class='sidebar__logo-image' src='{{this.rootUrl}}/pix-certif-logo.svg' alt={{t 'common.home-page'}} />
        </LinkTo>
      </header>

      <nav class='sidebar-menu'>
        <ul>
          {{#if this.showLinkToSessions}}
            <li>
              <LinkTo
                @route='authenticated.sessions'
                class='sidebar-menu__item'
                type='button'
                aria-label={{t 'navigation.main.sessions-label'}}
              >
                <PixIcon @name='session' @plainIcon={{true}} class='sidebar-menu__item-icon' @ariaHidden={{true}} />
                {{t 'navigation.main.sessions'}}
              </LinkTo>
            </li>
            <li>
              <LinkTo
                @route='login-session-supervisor'
                class='sidebar-menu__item'
                type='button'
                target='_blank'
                rel='noopener noreferrer'
              >
                <PixIcon @name='eye' @plainIcon={{true}} class='sidebar-menu__item-icon' @ariaHidden={{true}} />
                {{t 'navigation.main.supervisor'}}
              </LinkTo>
            </li>
          {{/if}}
          <li>
            <LinkTo @route='authenticated.team' class='sidebar-menu__item' type='button'>
              <PixIcon @name='users' @plainIcon={{true}} class='sidebar-menu__item-icon' @ariaHidden={{true}} />
              {{t 'navigation.main.team'}}
            </LinkTo>
          </li>
          <li>
            <a class='sidebar-menu__item' href='{{this.documentationLink}}' target='_blank' rel='noopener noreferrer'>
              <PixIcon @name='book' @plainIcon={{true}} class='sidebar-menu__item-icon' @ariaHidden={{true}} />
              {{t 'navigation.main.documentation'}}
            </a>
          </li>
        </ul>
      </nav>

    </aside>
  </template>
}
