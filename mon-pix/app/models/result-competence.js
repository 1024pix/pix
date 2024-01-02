import Model, { attr, belongsTo } from '@ember-data/model';

export default class ResultCompetence extends Model {
  // attributes
  @attr('string') name;
  @attr('number') index;
  @attr('number') level;

  // includes
  @belongsTo('area', { async: true, inverse: 'resultCompetences' }) area;
}
