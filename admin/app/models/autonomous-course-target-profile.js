import Model, { attr, belongsTo } from '@ember-data/model';
import { service } from '@ember/service';

export default class AutonomousCourseTargetProfile extends Model {
  @service session;

  @attr('nullable-string') name;
  @attr('string') category;

  @belongsTo('organization') organization;
}
