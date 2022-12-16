import Model, { belongsTo, attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
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
