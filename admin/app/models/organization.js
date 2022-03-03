import { memberAction } from 'ember-api-actions';
import Model, { hasMany, attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { equal } from '@ember/object/computed';
import dayjs from 'dayjs';

export default class Organization extends Model {
  @attr() name;
  @attr() type;
  @attr() logoUrl;
  @attr() externalId;
  @attr() provinceCode;
  @attr() isManagingStudents;
  @attr('boolean') showNPS;
  @attr('string') formNPSUrl;
  @attr() credit;
  @attr() email;
  @attr() createdBy;
  @attr('string') documentationUrl;
  @attr('boolean') showSkills;
  @attr() archivistFullName;
  @attr() archivedAt;

  @equal('type', 'SCO') isOrganizationSCO;
  @equal('type', 'SUP') isOrganizationSUP;

  @hasMany('membership') memberships;
  @hasMany('targetProfile') targetProfiles;
  @hasMany('tag') tags;

  async hasMember(userEmail) {
    const memberships = await this.memberships;
    return !!memberships.findBy('user.email', userEmail);
  }

  get archivedFormattedDate() {
    return dayjs(this.archivedAt).format('DD/MM/YYYY');
  }

  attachTargetProfiles = memberAction({
    path: 'target-profiles',
    type: 'post',
    before(attributes) {
      const payload = this.serialize();
      payload.data.attributes = Object.assign(payload.data.attributes, attributes);
      return payload;
    },
    after(response) {
      this.targetProfiles.reload();
      return response;
    },
  });
}
