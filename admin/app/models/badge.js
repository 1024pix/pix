import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Badge extends Model {
  @attr('string') key;
  @attr('string') title;
  @attr('string') message;
  @attr('string') imageUrl;
  @attr('string') altMessage;
  @attr('boolean') isCertifiable;
  @attr('boolean') isAlwaysVisible;

  // creation only fields
  @attr('number') campaignThreshold;
  @attr('number') skillSetThreshold;
  @attr('string') skillSetName;
  @attr('array') skillSetSkillsIds;

  @belongsTo('target-profile') targetProfile;
  @hasMany('badge-criterion') badgeCriteria;
  @hasMany('skill-set') skillSets;
}
