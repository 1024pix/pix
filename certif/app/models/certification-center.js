/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';

export default class CertificationCenter extends Model {
  @attr() name;
  @attr() type;
  @attr() externalId;
  @attr() isRelatedOrganizationManagingStudents;
  @equal('type', 'SCO') isSco;

  @computed('type', 'isRelatedOrganizationManagingStudents')
  get isScoManagingStudents() {
    return this.type === 'SCO' && this.isRelatedOrganizationManagingStudents;
  }
}
