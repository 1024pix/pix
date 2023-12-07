import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';
import { service } from '@ember/service';

export default class CertificationCenterMember extends Model {
  @service intl;

  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') isReferer;
  @attr('string') role;
  @attr('string') userId;

  certificationCenterMembersRole = {
    ADMIN: this.intl.t('pages.team.members.role.admin'),
    MEMBER: this.intl.t('pages.team.members.role.member'),
  };

  get roleLabel() {
    return this.certificationCenterMembersRole[this.role];
  }

}
