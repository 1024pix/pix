import DS from 'ember-data';

const { Model, belongsTo } = DS;

export default class CertificationCenterMembership extends Model {
  @belongsTo('user') user;
  @belongsTo('certificationCenter') certificationCenter;
}
