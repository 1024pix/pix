// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal } from '@ember/object/computed';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class OrganizationInvitation extends Model {
  @attr email;
  @attr status;
  @attr createdAt;
  @attr organizationName;
  @attr lang;
  @attr role;
  @attr('date') updatedAt;

  @belongsTo('organization', { async: true, inverse: null }) organization;

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
