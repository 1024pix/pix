import {
  TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
  TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
  TARGET_PROFILE_PIX_DROIT_ID,
  TARGET_PROFILE_CNAV_ID,
} from './target-profiles-builder';

import {
  CERTIF_REGULAR_USER1_ID,
  CERTIF_REGULAR_USER2_ID,
  CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID,
  CERTIF_REGULAR_USER5_ID,
} from './certification/users';

import { PRO_BASICS_BADGE_ID, PRO_TOOLS_BADGE_ID } from './badges-builder';
import { PRO_COMPANY_ID, PRO_POLE_EMPLOI_ID, PRO_MED_NUM_ID, PRO_CNAV_ID } from './organizations-pro-builder';
import { DEFAULT_PASSWORD } from './users-builder';
import { participateToAssessmentCampaign, participateToProfilesCollectionCampaign } from './campaign-participations-builder';
import CampaignParticipationStatuses from '../../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

const POLE_EMPLOI_CAMPAIGN_ID = 5;

export default {
  campaignsProBuilder,
  POLE_EMPLOI_CAMPAIGN_ID,
};

function campaignsProBuilder({ databaseBuilder }) {
  _buildCampaigns({ databaseBuilder });
  _buildParticipations({ databaseBuilder });
}

function _buildCampaigns({ databaseBuilder }) {
  databaseBuilder.factory.buildCampaign({
    id: 1,
    name: 'Pro - Campagne d’évaluation 5.1',
    code: 'PROCOMP51',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_ONE_COMPETENCE_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    customResultPageText:
      'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix !',
    createdAt: new Date('2020-01-09'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 2,
    name: 'Pro - Campagne d’évaluation PIC - en cours',
    code: 'PROCUSTOM',
    type: 'ASSESSMENT',
    title: 'Parcours en cours',
    customLandingPageText: 'Ce parcours est proposé aux collaborateurs de Dragon & Co',
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    externalIdHelpImageUrl: 'https://placekitten.com/g/500/300',
    alternativeTextToExternalIdHelpImage: 'Votre identifiant est le nom du premier chaton',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix ! Avec du markdown ',
    customResultPageText: `---
__Plus d'infos :)__

- __[Pix](https://pix.fr)__ - Allez sur mon pix !
- __[Google](https://google.fr/)__ - Faites des recherches sur google.

---`,
    createdAt: new Date('2020-01-10'),
  });

  databaseBuilder.factory.buildCampaign({
    id: POLE_EMPLOI_CAMPAIGN_ID,
    name: 'Pro - Campagne Pix Emploi v3',
    code: 'PIXEMPLOI',
    type: 'ASSESSMENT',
    organizationId: PRO_POLE_EMPLOI_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-11'),
    multipleSendings: true,
  });

  databaseBuilder.factory.buildCampaign({
    id: 27,
    name: 'Pro - Campagne Pix CNAV',
    code: 'PIXCNAV01',
    organizationId: PRO_CNAV_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_CNAV_ID,
    assessmentMethod: 'SMART_RANDOM',
    createdAt: new Date('2020-01-11'),
    type: 'ASSESSMENT',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    multipleSendings: true,
  });

  databaseBuilder.factory.buildCampaign({
    id: 6,
    name: 'Pro - Campagne de collecte de profils',
    code: 'PROCOLECT',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-12'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 11,
    name: 'Pro - Med Num - Parcours simplifié',
    code: 'SIMPLIFIE',
    type: 'ASSESSMENT',
    title: 'Parcours simplifié',
    organizationId: PRO_MED_NUM_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    customLandingPageText: null,
    customResultPageText:
      'Afin de vous faire progresser, nous vous proposons des documents pour aller plus loin dans les compétences que vous venez de tester.',
    customResultPageButtonUrl: 'https://pix.fr/',
    customResultPageButtonText: 'Voir Pix !',
    createdAt: new Date('2020-01-13'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 12,
    name: 'Pro - Campagne d’évaluation PIC - Non partagé',
    code: 'PROPIC123',
    type: 'ASSESSMENT',
    title: 'Parcours terminé non partagé',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2020-01-14'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 13,
    name: 'Pro - Campagne d’évaluation PIC - Archivé partagé',
    code: 'ARCHIVED1',
    type: 'ASSESSMENT',
    title: 'Parcours archivé partagé',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    archivedAt: new Date('2020-01-02T15:00:34Z'),
    archivedBy: 3,
    createdAt: new Date('2020-01-15'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 14,
    name: 'Pro - Campagne d’évaluation PIC - Archivé en cours',
    code: 'ARCHIVED2',
    type: 'ASSESSMENT',
    title: 'Parcours archivé en cours',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2019-01-01'),
    archivedAt: new Date('2020-01-01T15:00:34Z'),
    archivedBy: 2,
  });

  databaseBuilder.factory.buildCampaign({
    id: 15,
    name: 'Pro - Campagne d’évaluation PIC - Archivé partagé avec paliers',
    code: 'ARCHIVED3',
    type: 'ASSESSMENT',
    title: 'Parcours archivé avec paliers',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    createdAt: new Date('2019-01-02'),
    archivedAt: new Date('2020-01-01T15:00:34Z'),
    archivedBy: 2,
  });

  databaseBuilder.factory.buildCampaign({
    id: 16,
    name: 'Pro - Campagne d’évaluation PIC - Terminé & partagé - Envois multiples',
    code: 'PROPICMUL',
    type: 'ASSESSMENT',
    title: 'Parcours terminé partagé - Envois multiple',
    customLandingPageText: null,
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_PIC_DIAG_INITIAL_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: 'identifiant entreprise',
    multipleSendings: true,
    createdAt: new Date('2020-01-16'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 17,
    name: 'Pro - Med Num - Parcours novice simplifié',
    code: 'NOVICE123',
    type: 'ASSESSMENT',
    title: 'Pour novice, accès simplifié',
    customLandingPageText: null,
    organizationId: PRO_MED_NUM_ID,
    creatorId: 2,
    ownerId: 2,
    targetProfileId: TARGET_PROFILE_SIMPLIFIED_ACCESS_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    isForAbsoluteNovice: true,
    createdAt: new Date('2020-01-17'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 18,
    name: 'Pro - Campagne de collecte de profils - Envois multiple',
    code: 'PROCOLMUL',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: 'identifiant entreprise',
    title: null,
    customLandingPageText: null,
    multipleSendings: true,
    createdAt: new Date('2020-01-18'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 19,
    name: 'Pro - Campagne d’évaluation FLASH',
    code: 'FLASH1234',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    targetProfileId: null,
    assessmentMethod: 'FLASH',
    creatorId: 3,
    ownerId: 3,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2021-11-09'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 21,
    name: 'Pro - Campagne d’évaluation Pix+ Droit',
    code: 'PRODROIT1',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 3,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
    multipleSendings: true,
  });

  databaseBuilder.factory.buildCampaign({
    id: 22,
    name: 'Pro - Campagne d’évaluation Badges',
    code: 'PROBADGE1',
    type: 'ASSESSMENT',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 3,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-04'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 25,
    name: 'Pro - Campagne de collecte de profils - Participation supprimée',
    code: 'PROCOLSUP',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2021-01-01'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 26,
    name: 'Pro - Campagne de collecte de profils - Envois Multiples - Participation supprimée',
    code: 'PROCOMUSU',
    type: 'PROFILES_COLLECTION',
    organizationId: PRO_COMPANY_ID,
    creatorId: 2,
    ownerId: 2,
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2021-01-02'),
  });
}

function _buildParticipations({ databaseBuilder }) {
  const users = _buildUsers({ databaseBuilder, users: [
    { firstName: 'Jaune', lastName: 'Attend', email: 'jaune.attend@example.net', createdAt: new Date('2022-01-01') },
    { firstName: 'Mélanie', lastName: 'Darboo', createdAt: new Date('2022-01-02') },
    { firstName: 'Matteo', lastName: 'Lorenzio', createdAt: new Date('2022-01-03') },
    { firstName: 'Jérémy', lastName: 'Bugietta', createdAt: new Date('2022-01-03') },
    { firstName: 'Léo', lastName: 'Subzéro', createdAt: new Date('2022-01-05') },
    { firstName: 'Forster', lastName: 'Gillay Djones', createdAt: new Date('2022-01-05') },
    { firstName: 'Thierry', lastName: 'Donckele', createdAt: new Date('2022-01-07') },
    { firstName: 'Stéphan', lastName: 'Deumonaco', createdAt: new Date('2022-01-08') },
    { firstName: 'Lise', lastName: 'Nelkay', createdAt: new Date('2022-01-09') },
    { firstName: 'Sébastien', lastName: 'Serra Oupas', createdAt: new Date('2022-02-03') },
    { firstName: 'Thomas', lastName: 'Whiskas', createdAt: new Date('2022-02-06') },
    { firstName: 'Antoine', lastName: 'Boiduvin', createdAt: new Date('2022-02-07') },
    { firstName: 'Brandone', lastName: 'Bro', createdAt: new Date('2022-02-07') },
    { firstName: 'Jean', lastName: 'Sérien', createdAt: new Date('2022-02-07') },
  ] });

  _buildParticipationsInDifferentStatus({ databaseBuilder, user: users[0] });
  _buildAssessmentParticipations({ databaseBuilder, users });
  _buildProfilesCollectionParticipations({ databaseBuilder, users });

  _buildMedNumAssessmentParticipations({ databaseBuilder });
}

function _buildUsers({ databaseBuilder, users }) {
  return users.map((user) => {
    const databaseUser = databaseBuilder.factory.buildUser.withRawPassword({ ...user, rawPassword: DEFAULT_PASSWORD });
    databaseBuilder.factory.buildOrganizationLearner({ firstName: user.firstName + '-Prescrit', lastName: user.lastName + '-Prescrit', id: databaseUser.id, userId: databaseUser.id, organizationId: PRO_COMPANY_ID });
    return databaseUser;
  });
}

function _buildParticipationsInDifferentStatus({ databaseBuilder, user }) {
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 22, user, organizationLearnerId: user.id, status: STARTED, deleted: true }); //deleted + started
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 21, user, organizationLearnerId: user.id, status: SHARED, deleted: true }); //deleted + shared
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 2, user, organizationLearnerId: user.id, status: STARTED }); //started
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 12, user, organizationLearnerId: user.id, status: TO_SHARE }); //to share
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 13, user, organizationLearnerId: user.id, status: SHARED });//archived + shared
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 14, user, organizationLearnerId: user.id, status: STARTED });//archived + started
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 15, user, organizationLearnerId: user.id, status: SHARED });//archived + shared + badges
}

function _buildAssessmentParticipations({ databaseBuilder, users }) {
  const userIdsNotCompleted = [users[1], users[2]];
  const userIdsNotShared = [users[4], users[5], users[8]];
  const userIdsNotShared2 = [users[6], users[7]];
  const userIdsCompletedShared = [users[10], users[12]];
  const userIdsCompletedShared2 = [users[0], users[9]];
  const userIdsCompletedSharedWith2Badges = [users[3], users[11]];

  userIdsNotCompleted.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: STARTED }));
  userIdsNotShared.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: TO_SHARE }));
  userIdsNotShared2.forEach((user) => {
    const campaignParticipationId = participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: TO_SHARE });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
  });
  userIdsCompletedShared.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: SHARED }));
  userIdsCompletedShared2.forEach((user) => {
    const campaignParticipationId = participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: SHARED });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });
  });
  userIdsCompletedSharedWith2Badges.forEach((user) => {
    const campaignParticipationId = participateToAssessmentCampaign({ databaseBuilder, campaignId: 1, user, organizationLearnerId: user.id, status: SHARED });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_BASICS_BADGE_ID, campaignParticipationId });
    databaseBuilder.factory.buildBadgeAcquisition({ userId: user.id, badgeId: PRO_TOOLS_BADGE_ID, campaignParticipationId });
  });

  //multiple sendings profiles collection campaign
  userIdsNotCompleted.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, organizationLearnerId: user.id, status: STARTED }));
  userIdsNotShared.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, organizationLearnerId: user.id, status: TO_SHARE }));
  userIdsNotShared2.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, organizationLearnerId: user.id, status: TO_SHARE, isImprovingOldParticipation: true }));
  userIdsCompletedShared.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, organizationLearnerId: user.id, status: SHARED }));
  userIdsCompletedShared2.forEach((user) => participateToAssessmentCampaign({ databaseBuilder, campaignId: 16, user, organizationLearnerId: user.id, status: SHARED, isImprovingOldParticipation: true }));
}

function _buildProfilesCollectionParticipations({ databaseBuilder, users }) {
  const userIdsNotShared = [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]];
  const userIdsShared = [users[0], users[9], users[10], users[11], users[12]];
  const certifRegularUser1 = { id: CERTIF_REGULAR_USER1_ID, createdAt: new Date('2022-02-04') };
  const certifRegularUser2 = { id: CERTIF_REGULAR_USER2_ID, createdAt: new Date('2022-02-05') };
  const certifRegularUser3 = { id: CERTIF_REGULAR_USER3_ID, createdAt: new Date('2022-02-05') };
  const certifRegularUser4 = { id: CERTIF_REGULAR_USER4_ID, createdAt: new Date('2022-02-06') };
  const certifRegularUser5 = { id: CERTIF_REGULAR_USER5_ID, createdAt: new Date('2022-02-07') };
  const userIdsCertifiable = [users[10].id, users[11].id, users[12].id];

  [certifRegularUser1, certifRegularUser2, certifRegularUser3, certifRegularUser4, certifRegularUser5].forEach((certifUser, index) => {
    databaseBuilder.factory.buildOrganizationLearner({ lastName: `Certif${index}`, firstName: `User${index}`, id: certifUser.id, userId: certifUser.id, organizationId: PRO_COMPANY_ID });
  });

  [...userIdsNotShared, certifRegularUser4, certifRegularUser5].forEach((user) => participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 6, user, organizationLearnerId: user.id, status: TO_SHARE }));
  [...userIdsShared, certifRegularUser1, certifRegularUser2, certifRegularUser3].forEach((user) => participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 6, user, organizationLearnerId: user.id, status: SHARED }));

  //multiple sendings profiles collection campaign
  userIdsShared.forEach((user) => participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, organizationLearnerId: user.id, status: SHARED, isCertifiable: userIdsCertifiable.includes(user.id) }));
  userIdsNotShared.forEach((user) => participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, organizationLearnerId: user.id, status: TO_SHARE, isImprovingOldParticipation: true, isCertifiable: null }));
  [certifRegularUser1, certifRegularUser2, certifRegularUser3, certifRegularUser4, certifRegularUser5].forEach((user) => participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user, organizationLearnerId: user.id, status: SHARED, isImprovingOldParticipation: true }));

  //deleted participations
  participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 25, user: users[0], organizationLearnerId: users[0].id, status: TO_SHARE, deleted: true });
  participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 26, user: users[0], organizationLearnerId: users[0].id, status: TO_SHARE, deleted: true });

  //certificability not shared
  participateToProfilesCollectionCampaign({ databaseBuilder, campaignId: 18, user: users[13], organizationLearnerId: users[13].id, status: TO_SHARE });
}

function _buildMedNumAssessmentParticipations({ databaseBuilder }) {
  const anonymousUser = databaseBuilder.factory.buildUser({
    firstName: '',
    lastName: '',
    cgu: false,
    mustValidateTermsOfService: false,
    isAnonymous: true,
    createdAt: new Date('2022-01-01'),
  });
  const anonymousOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: '',
    lastName: '',
    userId: anonymousUser.id,
    organizationId: PRO_MED_NUM_ID,
  });
  participateToAssessmentCampaign({ databaseBuilder, campaignId: 11, user: anonymousUser, organizationLearnerId: anonymousOrganizationLearner.id, status: SHARED });
}
