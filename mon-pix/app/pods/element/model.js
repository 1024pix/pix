import Model, { attr, belongsTo } from '@ember-data/model';

export default class Element extends Model {
  @attr('string') content;

  @belongsTo('module') module;
}
