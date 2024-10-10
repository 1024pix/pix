import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Header extends Component {
  @service currentUser;

  get displayImportButton() {
    return this.currentUser.isAdminInOrganization && this.currentUser.hasLearnerImportFeature;
  }

  get titleTranslationKey() {
    return this.currentUser.canAccessMissionsPage ? "components.organization-participants-header.sco.title" : "components.organization-participants-header.default.title"
  }

  <template>
    {{log "in the right component"}}
    <h1 class="organization-participant-list-page__header page-title">
      {{t this.titleTranslationKey count=@participantCount}}

      {{#if this.displayImportButton}}
        <div class="organization-participant-list-page__import-students-button hide-on-mobile">
          <PixButtonLink @route="authenticated.import-organization-participants">
            {{t "components.organization-participants-header.import-button"}}
          </PixButtonLink>
        </div>
      {{/if}}
    </h1>
  </template>
}
