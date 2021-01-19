import { memberAction } from 'ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('boolean') outdated;
  @attr('string') ownerOrganizationId;

  @hasMany('badge') badges;
  @hasMany('skill') skills;
  @hasMany('tube') tubes;
  @hasMany('competence') competences;
  @hasMany('area') areas;

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
