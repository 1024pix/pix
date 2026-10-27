import * as buildDataProtectionOfficer from './build-data-protection-officer.js';
import * as builders from './builders.ts';
import * as campaignParticipationOverviewFactory from './campaign-participation-overview-factory.js';
import * as knowledgeElementSnapshotFactory from './knowledge-elements-snapshot-factory.ts';
import * as learningContent from './learning-content/index.js';
import * as llm from './llm/index.js';
import * as poleEmploiSendingFactory from './pole-emploi-sending-factory.js';
import * as organizationLearners from './prescription/organization-learners/index.ts';

export const factory = {
  ...builders,
  prescription: {
    organizationLearners,
  },
  campaignParticipationOverviewFactory,
  knowledgeElementSnapshotFactory,
  poleEmploiSendingFactory,
  buildDataProtectionOfficer,
  learningContent,
  llm,
};
