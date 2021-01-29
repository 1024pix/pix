import Model, { attr, belongsTo } from '@ember-data/model';

export default class CertificationCenterMembership extends Model {

  @attr('date') createdAt;

  @belongsTo('certification-center') certificationCenter;
  @belongsTo('user') user;

}
