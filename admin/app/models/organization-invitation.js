/* eslint-disable ember/no-computed-properties-in-native-classes */

import Model, { belongsTo, attr } from '@ember-data/model';
import { equal } from '@ember/object/computed';

export default class OrganizationInvitation extends Model {
  @attr email;
  @attr status;
  @attr createdAt;
  @attr organizationName;
  @attr lang;
  @attr role;
  @attr('date') updatedAt;

  @belongsTo('organization') organization;

  @equal('status', 'pending') isPending;
  @equal('status', 'accepted') isAccepted;

  get roleInFrench() {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MEMBER':
        return 'Membre';
      default:
        return '-';
    }
  }
}
