import DS from 'ember-data';
const { Model, attr } = DS;

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') hasBadges;
}
