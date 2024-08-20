import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CertificationCentersMembershipItemRoleComponent extends Component {
  @service intl;

  get certificationCenterRoles() {
    return [
      { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
      { value: 'MEMBER', label: this.intl.t('common.roles.member') },
    ];
  }

  <template>
    {{#if @isEditionMode}}
      <PixSelect
        @onChange={{@onRoleSelected}}
        @value={{@role}}
        @screenReaderOnly={{true}}
        @options={{this.certificationCenterRoles}}
      >
        <:label>{{t "components.certification-centers.membership-item-role.select-role"}}</:label>
        <:default as |certificationCenterRole|>{{certificationCenterRole.label}}</:default>
      </PixSelect>
    {{else}}
      {{t @roleLabelKey}}
    {{/if}}
  </template>
}
