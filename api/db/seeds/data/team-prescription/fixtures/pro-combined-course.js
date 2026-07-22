import { faker } from '@faker-js/faker';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { REQUIREMENT_TYPES } from '../../../../../src/quest/domain/models/quests/entities/Quest.js';
import { PRO_ORGANIZATION_ID } from '../../common/constants.js';
import { CAMPAIGN_PRO_COMBINED_COURSE_ID, SIXTH_GRADE_REWARD_ID } from '../constants.js';

export const PRO_COMBINED_COURSE = {
  organizationId: PRO_ORGANIZATION_ID,
  blueprint: {
    name: 'Parcours apprenant complet',
    internalName: 'Parcours apprenant complet',
    requirements: [
      { type: 'evaluation' },
      { type: 'module', moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a' },
      { type: 'module', moduleId: 'f32a2238-4f65-4698-b486-15d51935d335' },
      {
        requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
        data: {
          cappedTubes: [{ tubeId: 'recrkpItPsNRg2OjJ', level: 2 }],
          threshold: 50,
        },
      },
    ],
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: SIXTH_GRADE_REWARD_ID,
    description:
      "#Un parcours\n pour découvrir l'essentiel sur l'intelligence artificielle : [comprendre sa définition](http://pix.fr), ses domaines d'application, comment elle fonctionne, ainsi que ses enjeux, notamment en matière d'impact environnemental.",
    surveyUrl: 'http://pix.fr',
  },
  combinedCourse: {
    code: 'COMBINIX1',
  },
  targetProfile: {
    description: 'Description parcours combinix 1',
    name: 'Parcours combinix 1',
    stages: [
      { title: 'Stage 0', threshold: 0 },
      { title: 'Stage 1', threshold: 20 },
      { title: 'Stage 2', threshold: 40 },
      { title: 'Stage 3', threshold: 60 },
      { title: 'Stage 4', threshold: 80 },
    ],
    tubes: [
      { id: 'recrkpItPsNRg2OjJ', level: 2 },
      { id: 'recpQLhHdOTQAx6UL', level: 2 },
      { id: 'recMPzW9BRjRdOisX', level: 2 },
      { id: 'recVpgUtxW3xx5Pu', level: 2 },
    ],
    campaign: {
      id: CAMPAIGN_PRO_COMBINED_COURSE_ID,
      name: 'Je teste mes compétences',
      code: 'CODE123',
      customResultPageButtonText: 'Continuer',
      customResultPageButtonUrl: '/parcours/COMBINIX1/chargement',
      skills: ['rec0J9OXaAj5v7w3r', 'rec1BJ9Z7bZRX2zkY', 'rec1EM9oLKC6itxs0', 'rec1kFnt3fpPE6Ixe'],
    },
    trainings: [
      {
        title: 'Demo combinix 1',
        internalTitle: 'Demo combinix 1',
        link: '/modules/27d6ca4f/demo-combinix-1',
        type: 'modulix',
        duration: '0 years 0 mons 0 days 0 hours 1 mins 0.0 secs',
        locales: ['fr', 'fr-fr'],
        editorName: 'Pix',
        editorLogoUrl: 'https://assets.pix.org/modules/placeholder-details.svg',
        isDisabled: false,
        threshold: 49,
        triggerType: 'goal',
      },
      {
        title: 'Demo combinix 2',
        internalTitle: 'Demo combinix 2',
        link: '/modules/df82ec66/demo-combinix-2',
        type: 'modulix',
        duration: '0 years 0 mons 0 days 0 hours 1 mins 0.0 secs',
        locales: ['fr', 'fr-fr'],
        editorName: 'Pix',
        editorLogoUrl: 'https://assets.pix.org/modules/placeholder-details.svg',
        isDisabled: false,
        threshold: 50,
        triggerType: 'prerequisite',
      },
    ],
  },
  participations: [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: 'combined@example.net',
      status: OrganizationLearnerParticipationStatuses.STARTED,
      campaignStatus: CampaignParticipationStatuses.SHARED,
    },
  ],
};
