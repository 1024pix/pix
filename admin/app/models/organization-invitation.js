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

  @belongsTo('organization') organization;

  @equal('status', 'pending') isPending;
  @equal('status', 'accepted') isAccepted;
}
