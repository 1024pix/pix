import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class NoSessionPanel extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;

  get isScoManagingStudents() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  get shouldRenderImportTemplateButton() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.primaryLocale;
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    return !this.isScoManagingStudents && !isOrgTldAndEnglishCurrentLanguage;
  }

  <template>
    <div class='no-session-panel'>
      <img class='no-session-panel__icon' src='{{this.rootURL}}/icons/empty-list-session.svg' alt='' role='none' />
      <h1 class='page-title'>{{t 'pages.sessions.list.empty.title'}}</h1>

      <ul class='no-session-panel__link-to-create'>
        <li>
          <PixButtonLink @route='authenticated.sessions.new'>
            {{t 'pages.sessions.list.actions.creation.label'}}
          </PixButtonLink>
        </li>
        {{#if this.shouldRenderImportTemplateButton}}
          <li>
            <PixButtonLink @route='authenticated.sessions.import' @variant='secondary' @isBorderVisible='true'>
              {{t 'pages.sessions.list.actions.multiple-creation.label'}}
            </PixButtonLink>
          </li>
        {{/if}}
      </ul>
    </div>
  </template>
}
