import { PixPagination, PixTable } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import MembersListItem from './members-list-item';

export default class MembersList extends Component {
  @service currentUser;
  @service locale;
  @tracked members = [];

  constructor() {
    super(...arguments);

    Promise.resolve(this.args.members).then((members) => {
      this.members = members;
    });
  }

  get displayManagingColumn() {
    return this.currentUser.isAdminInOrganization;
  }

  get isMultipleAdminsAvailable() {
    return this.args.members?.filter((member) => member.isAdmin).length > 1;
  }

  <template>
    <PixTable @variant="orga" @caption={{@caption}} @data={{@members}} class="table">
      <:columns as |membership context|>
        <MembersListItem
          @membership={{membership}}
          @context={{context}}
          @displayManagingColumn={{this.displayManagingColumn}}
          @isMultipleAdminsAvailable={{this.isMultipleAdminsAvailable}}
          @onRemoveMember={{@onRemoveMember}}
          @onLeaveOrganization={{@onLeaveOrganization}}
        />
      </:columns>
    </PixTable>

    {{#unless @members}}
      <div class="table__empty content-text">{{t "pages.team-members.table.empty"}}</div>
    {{/unless}}

    {{#if @members}}
      <PixPagination @pagination={{@members.meta}} @locale={{this.locale.currentLanguage}} />
    {{/if}}
  </template>
}
