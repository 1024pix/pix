import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class Course extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('number') nbTubes;
  @attr('number') nbModules;
  @attr('string') category;
  @attr('boolean') isSimplifiedAccess;
  @hasMany('area', { async: false, inverse: null }) areas;
}
