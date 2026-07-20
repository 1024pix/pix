export function createCertificationFramework({ id, versionsData = [], targetProfilesData = [] }, server) {
  const versionSummaries = [];
  const targetProfileSummaries = [];
  for (const versionData of versionsData) {
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: versionData.id,
        startDate: versionData.startDate,
        expirationDate: versionData.expirationDate,
        assessmentDuration: versionData.assessmentDuration ?? 60,
        maximumAssessmentLength: versionData.maximumAssessmentLength ?? 32,
        status: versionData.status,
      }),
    );
    server.create('certification-version', {
      id: versionData.id,
      startDate: versionData.startDate,
      expirationDate: versionData.expirationDate,
      assessmentDuration: versionData.assessmentDuration ?? 60,
      maximumAssessmentLength: versionData.maximumAssessmentLength ?? 32,
      minimumAnswersRequiredForValidation: versionData.minimumAnswersRequiredForValidation ?? 20,
      challengesBetweenSameCompetence: versionData.challengesBetweenSameCompetence ?? 2,
      defaultProbabilityToPickChallenge: versionData.defaultProbabilityToPickChallenge ?? 10,
      variationPercent: versionData.variationPercent ?? 0.66,
      defaultCandidateCapacity: versionData.defaultCandidateCapacity ?? -1,
      limitToOneQuestionPerTube: versionData.limitToOneQuestionPerTube,
      enablePassageByAllCompetences: versionData.enablePassageByAllCompetences,
      scope: versionData.scope ?? 'CORE',
      comments: versionData.comments ?? 'default comments',
      status: versionData.status ?? 'draft',
    });
  }
  if (targetProfilesData.length > 0) {
    server.create('complementary-certification', {
      key: id,
      label: `label for ${id}`,
    });
  }
  for (const targetProfileData of targetProfilesData) {
    const badgeSummaries = [];
    for (const badgeData of targetProfileData.badgesData ?? []) {
      badgeSummaries.push(
        server.create('certification-badge-summary', {
          id: badgeData.id,
          label: badgeData.label ?? 'default label',
          level: badgeData.level ?? 1,
          imageUrl: badgeData.imageUrl ?? 'default image url',
          minimumEarnedPix: badgeData.minimumEarnedPix ?? 1,
          createdAt: badgeData.createdAt,
          detachedAt: badgeData.detachedAt,
        }),
      );
    }
    targetProfileSummaries.push(
      server.create('certification-target-profile-summary', {
        id: targetProfileData.id,
        name: targetProfileData.name ?? 'default name',
        badgeSummaries: badgeSummaries,
      }),
    );
    server.create('target-profile', {
      id: targetProfileData.id,
      name: targetProfileData.name ?? 'default name',
    });
  }
  server.create('certification-framework', { id, scope: id, versionSummaries, targetProfileSummaries });
}
