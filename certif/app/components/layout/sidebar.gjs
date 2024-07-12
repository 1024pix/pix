import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';
const LINK_V3_PILOT = 'https://cloud.pix.fr/s/f2PNGLajBypbaiJ';

export default class Sidebar extends Component {
  @service currentUser;

  get documentationLink() {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isV3Pilot) {
      return LINK_V3_PILOT;
    }
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
                @route='authenticated.sessions.list'
                class='sidebar-menu__item'
                type='button'
                aria-label={{t 'navigation.main.sessions-label'}}
              >
                {{! template-lint-disable no-redundant-role }}
                <img
                  src='{{this.rootURL}}/icons/chevron-square-right.svg'
                  alt=''
                  role='presentation'
                  class='sidebar-menu__item-icon sidebar-menu__item-icon-chevron'
                />
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
                <FaIcon @icon='eye' class='sidebar-menu__item-icon' />
                {{t 'navigation.main.supervisor'}}
              </LinkTo>
            </li>
          {{/if}}
          <li>
            <LinkTo @route='authenticated.team' class='sidebar-menu__item' type='button'>
              <FaIcon @icon='users' class='sidebar-menu__item-icon' />
              {{t 'navigation.main.team'}}
            </LinkTo>
          </li>
          <li>
            <a class='sidebar-menu__item' href='{{this.documentationLink}}' target='_blank' rel='noopener noreferrer'>
              <FaIcon @icon='book' class='sidebar-menu__item-icon' />
              {{t 'navigation.main.documentation'}}
            </a>
          </li>
        </ul>
      </nav>

    </aside>
  </template>
}
