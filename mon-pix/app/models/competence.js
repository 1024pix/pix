import Model, { attr, belongsTo } from '@ember-data/model';

export default class Competence extends Model {
  // attributes
  @attr('string') name;

  @belongsTo('area', { async: true, inverse: 'competences' }) area;
}
