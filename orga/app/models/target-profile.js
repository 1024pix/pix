import Model, { attr } from '@ember-data/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('number') tubeCount;
  @attr('number') thematicResultCount;
  @attr('boolean') hasStage;
  @attr('string') category;
  @attr('boolean') areKnowledgeElementsResettable;
}
