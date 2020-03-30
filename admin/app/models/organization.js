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

  @equal('type', 'SCO') isOrganizationSCO;

  @hasMany('membership') memberships;
  @hasMany('targetProfile') targetProfiles;

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
    }
  });
}
