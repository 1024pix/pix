import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Header extends Component {
  @service currentUser;
  @service intl;

  get displayImportButton() {
    return this.currentUser.isAdminInOrganization && this.currentUser.hasLearnerImportFeature;
  }

  get title() {
    return this.currentUser.canAccessMissionsPage
      ? this.intl.t('components.organization-participants-header.sco-title', { count: this.args.participantCount })
      : this.intl.t('components.organization-participants-header.title', { count: this.args.participantCount });
  }

  <template>
    <h1 class="organization-participant-list-page__header page-title">
      {{this.title}}

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
