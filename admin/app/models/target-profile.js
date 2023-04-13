import { memberAction } from 'ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';
import ENV from 'pix-admin/config/environment';
import { inject as service } from '@ember/service';
import formatList from '../utils/format-select-options';

export const categories = {
  COMPETENCES: 'Les 16 compétences',
  SUBJECT: 'Thématiques',
  DISCIPLINE: 'Disciplinaires',
  CUSTOM: 'Parcours sur-mesure',
  PREDEFINED: 'Parcours prédéfinis',
  OTHER: 'Autres',
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
  @attr('number') maxLevel;

  @hasMany('badge') badges;
  @hasMany('stage') stages;
  @hasMany('training-summary') trainingSummaries;

  @attr() isNewFormat;
  @hasMany('old-area') oldAreas;
  @hasMany('new-area') newAreas;

  get sortedOldAreas() {
    return this.oldAreas.sortBy('code');
  }

  get sortedNewAreas() {
    return this.newAreas.sortBy('code');
  }

  get urlToJsonContent() {
    return `${ENV.APP.API_HOST}/api/admin/target-profiles/${this.id}/content-json?accessToken=${this.session.data.authenticated.access_token}`;
  }

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
