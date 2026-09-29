import { PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import PageTitle from '../ui/page-title';

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
    <PageTitle>
      <:title>
        {{this.title}}
      </:title>
      <:tools>
        {{#if this.displayImportButton}}
          <PixButtonLink @route="authenticated.import-organization-participants" class="hide-on-mobile">
            {{t "components.organization-participants-header.import-button"}}
          </PixButtonLink>
        {{/if}}
      </:tools>
    </PageTitle>
  </template>
}
