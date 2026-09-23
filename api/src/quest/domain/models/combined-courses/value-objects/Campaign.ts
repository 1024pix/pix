import type { TargetProfile } from '../../combined-course-blueprints/value-objects/TargetProfile.ts';
import type { RecommendedModule } from '../../combined-course-participations/value-objects/RecommendedModule.ts';
import type { Module } from './Module.ts';

type CampaignParams = {
  id?: number;
  name: string;
  code?: string;
  targetProfileId: number;
  organizationId: number;
  creatorId: number;
  ownerId: number;
  title: string;
  customResultPageButtonUrl: string;
  customResultPageButtonText: string;
};

type CampaignForCombinedCourse = {
  organizationId: number;
  targetProfile: TargetProfile;
  creatorId: number;
  combinedCourseCode: string;
  recommendableModules?: RecommendedModule[] | null;
  modules: Module[];
};

export class Campaign {
  id?: number;
  name: string;
  code?: string;
  targetProfileId: number;
  organizationId: number;
  creatorId: number;
  ownerId: number;
  title: string;
  customResultPageButtonUrl: string;
  customResultPageButtonText: string;

  constructor({
    id,
    name,
    code,
    targetProfileId,
    organizationId,
    creatorId,
    ownerId,
    title,
    customResultPageButtonUrl,
    customResultPageButtonText,
  }: CampaignParams) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.targetProfileId = targetProfileId;
    this.organizationId = organizationId;
    this.creatorId = creatorId;
    this.ownerId = ownerId;
    this.title = title;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.customResultPageButtonText = customResultPageButtonText;
  }

  static buildCampaignForCombinedCourse({
    organizationId,
    targetProfile,
    creatorId,
    combinedCourseCode,
    recommendableModules,
    modules,
  }: CampaignForCombinedCourse) {
    let hasRecommendableModulesInTargetProfile;
    if (recommendableModules) {
      const matchingRecommendableModules = recommendableModules.filter(({ moduleId }) =>
        modules.map(({ id }) => id).includes(moduleId),
      );
      hasRecommendableModulesInTargetProfile = matchingRecommendableModules.length > 0;
    }

    let combinedCourseUrl = '/parcours/' + combinedCourseCode;

    if (hasRecommendableModulesInTargetProfile) combinedCourseUrl += '/chargement';

    return new Campaign({
      organizationId: organizationId,
      targetProfileId: targetProfile.id,
      creatorId,
      ownerId: creatorId,
      name: targetProfile.internalName,
      title: targetProfile.name,
      customResultPageButtonUrl: combinedCourseUrl,
      customResultPageButtonText: 'Continuer',
    });
  }
}
