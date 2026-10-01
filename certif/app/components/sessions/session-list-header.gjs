import { PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class SessionListHeader extends Component {
  @service currentUser;
  @service currentDomain;
  @service locale;

  get shouldRenderImportTemplateButton() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLocale = this.locale.currentLocale;
    const isOrgTldAndEnglishCurrentLocale = topLevelDomain === 'org' && currentLocale === 'en';

    return (
      !this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      !isOrgTldAndEnglishCurrentLocale
    );
  }

  <template>
    <div class='session-list__header'>
      <h1 class='page-title'>{{t 'pages.sessions.list.title'}}</h1>
      <ul class='session-list-header__actions'>
        {{#if this.shouldRenderImportTemplateButton}}
          <li>
            <PixButtonLink @variant='secondary' @isBorderVisible='true' @route='authenticated.sessions.import'>
              {{t 'pages.sessions.list.actions.multiple-creation-edition.label'}}
            </PixButtonLink>
          </li>
        {{/if}}
        <li>
          <PixButtonLink @route='authenticated.sessions.new'>
            {{t 'pages.sessions.list.actions.creation.label'}}
          </PixButtonLink>
        </li>
      </ul>
    </div>
  </template>
}
