import { memberAction } from 'ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';
import map from 'lodash/map';

export const categories = {
  COMPETENCES: 'Les 16 compétences',
  SUBJECT: 'Thématiques',
  DISCIPLINE: 'Disciplinaires',
  CUSTOM: 'Parcours sur-mesure',
  PREDEFINED: 'Parcours prédéfinis',
  OTHER: 'Autres',
};

export const optionsCategoryList = map(categories, function (key, value) {
  return { value: value, label: key };
});

export default class TargetProfile extends Model {
  @attr('string') name;
  @attr('boolean') isPublic;
  @attr('date') createdAt;
  @attr('string') imageUrl;
  @attr('boolean') outdated;
  @attr('string') description;
  @attr('string') comment;
  @attr('string') ownerOrganizationId;
  @attr('string') category;

  @attr('array') skillIds;

  @hasMany('badge') badges;
  @hasMany('stage') stages;
  @hasMany('skill') skills;
  @hasMany('tube') tubes;
  @hasMany('competence') competences;
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
