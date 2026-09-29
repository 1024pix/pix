import { PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import PageTitle from '../ui/page-title';

export default class SupHeaderActions extends Component {
  @service currentUser;

  <template>
    <div class="organization-participant-list-page__header">
      <PageTitle>
        <:title>
          {{t "pages.sup-organization-participants.title" count=@participantCount}}
        </:title>
        <:tools>
          {{#if this.currentUser.isAdminInOrganization}}
            <PixButtonLink @route="authenticated.import-organization-participants">
              {{t "components.organization-participants-header.import-button"}}
            </PixButtonLink>
          {{/if}}
        </:tools>
      </PageTitle>
    </div>
  </template>
}
