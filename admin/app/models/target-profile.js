import { service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

import formatList from '../utils/format-select-options';

export const categories = {
  OTHER: 'Autres',
  DISCIPLINE: 'Disciplinaires',
  COMPETENCES: 'Les 16 compétences',
  PREDEFINED: 'Parcours prédéfinis',
  CUSTOM: 'Parcours sur-mesure',
  PIX_PLUS: 'Pix+',
  SUBJECT: 'Thématiques',
};

export const optionsCategoryList = formatList(categories);

export default class TargetProfile extends Model {
  @service session;

  @attr('nullable-string') name;
  @attr('boolean') isPublic;
  @attr('date') createdAt;
  @attr('nullable-string') imageUrl;
  @attr('boolean') outdated;
  @attr('nullable-text') description;
  @attr('nullable-text') comment;
  @attr('string') ownerOrganizationId;
  @attr('string') category;
  @attr('boolean') isSimplifiedAccess;
  @attr('boolean') areKnowledgeElementsResettable;
  @attr('boolean') hasLinkedCampaign;
  @attr('boolean') hasLinkedAutonomousCourse;
  @attr('number') maxLevel;

  @hasMany('badge') badges;
  @belongsTo('stage-collection') stageCollection;
  @hasMany('training-summary') trainingSummaries;

  @hasMany('area') areas;

  attachOrganizations = memberAction({
    path: 'attach-organizations',
    type: 'post',
  });

  attachOrganizationsFromExistingTargetProfile = memberAction({
    path: 'copy-organizations',
    type: 'post',
  });

  outdate = memberAction({
    path: 'outdate',
    type: 'put',
    after() {
      this.reload();
    },
  });
}
