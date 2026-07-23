import Model, { attr } from '@warp-drive/legacy/model';

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('number') tubeCount;
  @attr('number') thematicResultCount;
  @attr('boolean') hasStage;
  @attr('string') category;
  @attr('boolean') areKnowledgeElementsResettable;
  @attr('boolean') isSimplifiedAccess;
}
