export class Campaign {
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
  }) {
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
  }) {
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
      organizationId: parseInt(organizationId),
      targetProfileId: targetProfile.id,
      creatorId: parseInt(creatorId),
      ownerId: parseInt(creatorId),
      name: targetProfile.internalName,
      title: targetProfile.name,
      customResultPageButtonUrl: combinedCourseUrl,
      customResultPageButtonText: 'Continuer',
    });
  }
}
