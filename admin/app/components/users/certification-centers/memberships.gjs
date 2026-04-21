import PixTable from '@1024pix/pix-ui/components/pix-table';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import MembershipItem from './membership-item';

export default class Memberships extends Component {
  get orderedCertificationCenterMemberships() {
    return [...this.args.certificationCenterMemberships].sort((a, b) =>
      a.certificationCenter?.get('name')?.localeCompare(b.certificationCenter?.get('name')),
    );
  }

  <template>
    <header class="header page-section__header">
      <h2 class="page-section__title">{{t "components.users.certification-centers.memberships.section-title"}}</h2>
    </header>

    {{#if this.orderedCertificationCenterMemberships}}
      <PixTable
        @variant="admin"
        @data={{this.orderedCertificationCenterMemberships}}
        @caption={{t "components.users.certification-centers.memberships.caption"}}
      >
        <:columns as |certificationCenterMembership context|>
          <MembershipItem
            @certificationCenterMembership={{certificationCenterMembership}}
            @context={{context}}
            @onCertificationCenterMembershipRoleChange={{@onCertificationCenterMembershipRoleChange}}
            @disableCertificationCenterMembership={{@disableCertificationCenterMembership}}
          />
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "components.users.certification-centers.memberships.empty-table"}}</div>
    {{/if}}
  </template>
}
