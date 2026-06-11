import Model, { attr, hasMany } from '@ember-data/model';

export default class TargetProfileOverview extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('boolean') areKnowledgeElementsResettable;
  @attr('boolean') isSimplifiedAccess;

  @attr('string') imageUrl;
  @attr('string') category;
  @attr('number') level;

  @hasMany('framework', { async: false, inverse: null }) frameworks;
  @hasMany('badge', { async: false, inverse: null }) badges;
}
