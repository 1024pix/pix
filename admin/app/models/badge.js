import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Badge extends Model {
  @attr('string') key;
  @attr('string') title;
  @attr('string') message;
  @attr('string') imageUrl;
  @attr('string') altMessage;
  @attr('boolean') isCertifiable;

  @belongsTo('target-profile') targetProfile;
  @hasMany('badge-criterion') badgeCriteria;
  @hasMany('badge-partner-competence') badgePartnerCompetences;
}
