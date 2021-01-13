import { memberAction } from 'ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('boolean') outdated;
  @attr('string') organizationId;

  @hasMany('badge') badges;
  @hasMany('skill') skills;

  attachOrganizations = memberAction({
    path: 'attach-organizations',
    type: 'post',
    before(attributes) {
      return { ...attributes };
    },
    after() {
      this.reload();
    },
  });
}
