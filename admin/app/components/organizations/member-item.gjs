import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

import ActionsOnUsersRoleInOrganization from '../actions-on-users-role-in-organization';

export default class MemberItem extends Component {
  @service intl;

  get lastAccessedAt() {
    if (!this.args.organizationMembership.lastAccessedAt) {
      return this.intl.t('components.organizations.member-items.no-last-connection-date-info');
    }
    return dayjs(this.args.organizationMembership.lastAccessedAt).format('DD/MM/YYYY');
  }

  <template>
    <PixTableColumn @context={{@context}}>
      <:header>
        ID user
      </:header>
      <:cell>
        <LinkTo @route="authenticated.users.get" @model={{@organizationMembership.user.id}}>
          {{@organizationMembership.user.id}}
        </LinkTo>
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        Prénom
      </:header>
      <:cell>
        {{@organizationMembership.user.firstName}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        Nom
      </:header>
      <:cell>
        {{@organizationMembership.user.lastName}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}} class="break-word">
      <:header>
        Adresse e-mail
      </:header>
      <:cell>
        {{@organizationMembership.user.email}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        Dernier accès
      </:header>
      <:cell>
        {{this.lastAccessedAt}}
      </:cell>
    </PixTableColumn>
    <ActionsOnUsersRoleInOrganization @organizationMembership={{@organizationMembership}} @context={{@context}} />
  </template>
}
