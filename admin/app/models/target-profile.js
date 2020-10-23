import Model, { attr, hasMany } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('boolean') outdated;
  @attr('string') organizationId;

  @hasMany('organization') organizations;
}
