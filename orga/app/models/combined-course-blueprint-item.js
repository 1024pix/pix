import Model, { attr } from '@ember-data/model';

export const CombinedCourseBlueprintItemTypes = {
  EVALUATION: 'evaluation',
  MODULE: 'module',
};

export const CombinedCourseBlueprintAssets = {
  CAMPAIGN_ICON: 'https://assets.pix.org/combined-courses/campaign-icon.svg',
  FORMATION_ICON: 'https://assets.pix.org/combined-courses/picto_formation_vector.svg',
};

export default class CombinedCourseBlueprintItem extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('number') duration;
  @attr('string') image;
  @attr('boolean') isRecommendable;

  get iconUrl() {
    if (this.type === CombinedCourseBlueprintItemTypes.EVALUATION) return CombinedCourseBlueprintAssets.CAMPAIGN_ICON;

    return this.image;
  }

  get isEvaluation() {
    return this.type === CombinedCourseBlueprintItemTypes.EVALUATION;
  }

  get isModule() {
    return this.type === CombinedCourseBlueprintItemTypes.MODULE;
  }
}
