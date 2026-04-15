import PixTable from '@1024pix/pix-ui/components/pix-table';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import InvitationsListItem from './invitations-list-item';

export default class TeamInvitationsListComponent extends Component {
  @service store;
  @service pixToast;
  @service currentUser;
  @service intl;

  @action
  async cancelInvitation(organizationInvitation) {
    try {
      const organizationId = this.currentUser.organization.id;

      organizationInvitation.deleteRecord();
      await organizationInvitation.save({
        adapterOptions: { organizationInvitationId: organizationInvitation.id, organizationId },
      });

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.team-invitations.invitation-cancelled-succeed-message'),
      });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('api-error-messages.global') });
    }
  }
  <template>
    <PixTable @variant="orga" @caption={{@caption}} @data={{@invitations}} class="table">
      <:columns as |invitation context|>
        <InvitationsListItem
          @invitation={{invitation}}
          @context={{context}}
          @cancelInvitation={{this.cancelInvitation}}
        />
      </:columns>
    </PixTable>
  </template>
}
