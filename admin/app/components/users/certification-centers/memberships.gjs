import Component from '@glimmer/component';
import { t } from 'ember-intl';

import MembershipItem from './membership-item';

export default class Memberships extends Component {
  get orderedCertificationCenterMemberships() {
    return this.args.certificationCenterMemberships.sortBy('certificationCenter.name');
  }

  <template>
    <header class="page-section__header">
      <h2 class="page-section__title">{{t "components.users.certification-centers.memberships.section-title"}}</h2>
    </header>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column table__column--id">{{t
                  "components.users.certification-centers.memberships.table-headers.member-id"
                }}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.center-id"}}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.center-name"}}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.center-type"}}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.center-external-id"}}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.role-label"}}</th>
              <th>{{t "components.users.certification-centers.memberships.table-headers.actions-label"}}</th>
            </tr>
          </thead>

          {{#if this.orderedCertificationCenterMemberships}}
            <tbody>
              {{#each this.orderedCertificationCenterMemberships as |certificationCenterMembership|}}
                <MembershipItem
                  @certificationCenterMembership={{certificationCenterMembership}}
                  @onCertificationCenterMembershipRoleChange={{@onCertificationCenterMembershipRoleChange}}
                  @disableCertificationCenterMembership={{@disableCertificationCenterMembership}}
                />
              {{/each}}
            </tbody>
          {{/if}}
        </table>

      </div>
      {{#unless this.orderedCertificationCenterMemberships}}
        <div class="table__empty">{{t "components.users.certification-centers.memberships.empty-table"}}</div>
      {{/unless}}
    </div>
  </template>
}
