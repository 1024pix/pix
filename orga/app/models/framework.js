import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Framework extends Model {
  @attr('string') name;

  @hasMany('area', { async: true, inverse: null }) areas;

  get sortedAreas() {
    return this.hasMany('areas')
      .value()
      .slice()
      .sort((a, b) => {
        return a.code.localeCompare(b.code);
      });
  }
}
