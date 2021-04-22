/* eslint-disable ember/no-computed-properties-in-native-classes */

import { memberAction } from 'ember-api-actions';
import Model, { hasMany, attr } from '@ember-data/model';
import { equal } from '@ember/object/computed';

export default class Organization extends Model {

  @attr() name;
  @attr() type;
  @attr() logoUrl;
  @attr() externalId;
  @attr() provinceCode;
  @attr() isManagingStudents;
  @attr() canCollectProfiles;
  @attr() credit;
  @attr() email;

  @equal('type', 'SCO') isOrganizationSCO;
  @equal('type', 'SUP') isOrganizationSUP;

  @hasMany('membership') memberships;
  @hasMany('targetProfile') targetProfiles;
  @hasMany('tag') tags;

  async hasMember(userEmail) {
    const memberships = await this.memberships;
    return !!memberships.findBy('user.email', userEmail);
  }

  attachTargetProfiles = memberAction({
    path: 'target-profiles',
    type: 'post',
    before(attributes) {
      const payload = this.serialize();
      payload.data.attributes = Object.assign(payload.data.attributes, attributes);
      return payload;
    },
    after() {
      this.targetProfiles.reload();
    },
  });
}
