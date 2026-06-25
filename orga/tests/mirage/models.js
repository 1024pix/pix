import { belongsTo, hasMany, Model } from 'miragejs';

export default {
  analysisByTube: Model.extend(),
  announcement: Model.extend(),
  area: Model.extend({
    competences: hasMany('competence'),
  }),
  attestation: Model.extend(),
  attestationParticipantStatus: Model.extend(),
  availableCampaignParticipation: Model.extend(),
  badge: Model.extend(),
  banner: Model.extend(),
  campaign: Model.extend({
    badges: hasMany('badge'),
    campaignCollectiveResult: belongsTo('campaignCollectiveResult'),
    campaignResultLevelsPerTubesAndCompetence: belongsTo('campaignResultLevelsPerTubesAndCompetence'),
    divisions: hasMany('division'),
    groups: hasMany('group'),
    organization: belongsTo('organization'),
    stages: hasMany('stage'),
    targetProfile: belongsTo('targetProfile'),
    course: belongsTo('course'),
  }),
  campaignAnalysis: Model.extend({
    campaignTubeRecommendations: hasMany('campaignTubeRecommendation'),
  }),
  campaignAssessmentParticipation: Model.extend({
    badges: hasMany('badge'),
    campaignAssessmentParticipationResult: belongsTo('campaignAssessmentParticipationResult'),
    campaignParticipationLevelsPerTubesAndCompetence: belongsTo('campaignParticipationLevelsPerTubesAndCompetence'),
  }),
  campaignAssessmentParticipationCompetenceResult: Model.extend({
    campaignAssessmentParticipationResult: belongsTo('campaignAssessmentParticipationResult'),
  }),
  campaignAssessmentParticipationResult: Model.extend({
    campaignAssessmentParticipation: belongsTo('campaignAssessmentParticipation'),
    competenceResults: hasMany('campaignAssessmentParticipationCompetenceResult'),
  }),
  campaignAssessmentResultMinimal: Model.extend({
    badges: hasMany('badge'),
  }),
  campaignCollectiveResult: Model.extend({
    campaignCompetenceCollectiveResults: hasMany('campaignCompetenceCollectiveResult'),
  }),
  campaignCompetenceCollectiveResult: Model.extend({
    campaignCollectiveResult: belongsTo('campaignCollectiveResult'),
  }),
  campaignParticipantActivity: Model.extend(),
  campaignParticipation: Model.extend({
    campaign: belongsTo('campaign'),
    campaignCollectiveResult: belongsTo('campaignCollectiveResult'),
    user: belongsTo('user'),
  }),
  campaignParticipationLevelsPerTubesAndCompetence: Model.extend({
    levelsPerCompetence: hasMany('levelsPerCompetence'),
  }),
  campaignProfile: Model.extend({
    competences: hasMany('campaignProfileCompetence'),
  }),
  campaignProfileCompetence: Model.extend(),
  campaignProfilesCollectionParticipationSummary: Model.extend(),
  campaignResultLevelsPerTubesAndCompetence: Model.extend({
    levelsPerCompetence: hasMany('levelsPerCompetence'),
  }),
  campaignTubeRecommendation: Model.extend(),
  combinedCourse: Model.extend({
    combinedCourseParticipations: hasMany('combinedCourseParticipation'),
    combinedCourseStatistics: belongsTo('combinedCourseStatistic'),
  }),
  combinedCourseBlueprint: Model.extend(),
  combinedCourseItem: Model.extend(),
  combinedCourseParticipation: Model.extend(),
  combinedCourseParticipationDetail: Model.extend({
    items: hasMany('combinedCourseItem'),
    participation: belongsTo('combinedCourseParticipation'),
  }),
  combinedCourseStatistic: Model.extend(),
  competence: Model.extend({
    thematics: hasMany('thematic'),
  }),
  course: Model.extend(),
  combinedCourseBlueprintItem: Model.extend(),
  combinedCourseBlueprintOverview: Model.extend({ items: hasMany('combinedCourseBlueprintItem') }),
  targetProfileOverview: Model.extend({ badges: hasMany('badge'), frameworks: hasMany('framework') }),
  dependentUser: Model.extend(),
  division: Model.extend(),
  featureToggle: Model.extend(),
  framework: Model.extend({
    areas: hasMany('area'),
  }),
  group: Model.extend(),
  informationBanner: Model.extend({
    banners: hasMany('banner'),
  }),
  levelsPerCompetence: Model.extend({
    campaignParticipationLevelsPerTubesAndCompetence: belongsTo('campaignParticipationLevelsPerTubesAndCompetence'),
    levelsPerTube: hasMany('levelsPerTube'),
  }),
  levelsPerTube: Model.extend({
    levelsPerCompetence: belongsTo('levelsPerCompetence'),
  }),
  memberIdentity: Model.extend(),
  membership: Model.extend({
    organization: belongsTo('organization'),
    user: belongsTo('user'),
  }),
  mission: Model.extend(),
  missionLearner: Model.extend(),
  oidcIdentityProvider: Model.extend(),
  organization: Model.extend({
    campaigns: hasMany('campaign'),
    combinedCourseBlueprints: hasMany('combinedCourseBlueprint'),
    combinedCourses: hasMany('combinedCourse'),
    divisions: hasMany('division'),
    groups: hasMany('group'),
    organizationInvitations: hasMany('organizationInvitation'),
    participationStatistics: belongsTo('participationStatistic'),
    targetProfiles: hasMany('targetProfile'),
  }),
  organizationImportDetail: Model.extend(),
  organizationInvitation: Model.extend({
    organization: belongsTo('organization'),
  }),
  organizationInvitationResponse: Model.extend(),
  organizationLearner: Model.extend(),
  organizationLearnerActivity: Model.extend({
    organizationLearnerParticipations: hasMany('organizationLearnerParticipation'),
    organizationLearnerStatistics: hasMany('organizationLearnerStatistic'),
  }),
  organizationLearnerParticipation: Model.extend({
    organizationLearnerActivity: belongsTo('organizationLearnerActivity'),
  }),
  organizationLearnerStatistic: Model.extend({
    organizationLearnerActivity: belongsTo('organizationLearnerActivity'),
  }),
  organizationParticipant: Model.extend(),
  organizationPlaceStatistic: Model.extend(),
  organizationPlacesLot: Model.extend(),
  participationStatistic: Model.extend(),
  prescriber: Model.extend({
    memberships: hasMany('membership'),
    userOrgaSettings: belongsTo('userOrgaSetting'),
  }),
  scoOrganizationInvitation: Model.extend(),
  scoOrganizationParticipant: Model.extend({
    organization: belongsTo('organization'),
  }),
  stage: Model.extend(),
  supOrganizationParticipant: Model.extend({
    organization: belongsTo('organization'),
  }),
  targetProfile: Model.extend(),
  thematic: Model.extend({
    tubes: hasMany('tube'),
  }),
  tube: Model.extend(),
  user: Model.extend({
    memberships: hasMany('membership'),
    userOrgaSettings: belongsTo('userOrgaSetting'),
  }),
  userOrgaSetting: Model.extend({
    organization: belongsTo('organization'),
    user: belongsTo('user'),
  }),
};
