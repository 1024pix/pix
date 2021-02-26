import { memberAction } from 'ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('date') createdAt;
  @attr('string') imageUrl;
  @attr('boolean') outdated;
  @attr('string') ownerOrganizationId;

  @attr('array') skillsId;

  @hasMany('badge') badges;
  @hasMany('stage') stages;
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
