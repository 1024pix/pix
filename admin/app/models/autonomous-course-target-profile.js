import { service } from '@ember/service';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class AutonomousCourseTargetProfile extends Model {
  @service session;

  @attr('nullable-string') name;
  @attr('string') category;

  @belongsTo('organization', { async: true, inverse: null }) organization;
}
