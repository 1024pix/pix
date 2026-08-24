import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Competence extends Model {
  @attr('string') name;
  @attr('string') index;

  @hasMany('thematic', { async: true, inverse: null }) thematics;

  get sortedThematics() {
    return this.hasMany('thematics')
      .value()
      .slice()
      .sort((a, b) => {
        return a.index - b.index;
      });
  }
}
