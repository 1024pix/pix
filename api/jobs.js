import { certificationEvaluationJobControllers } from './src/certification/evaluation/jobs.js';
import { certificationSessionManagementJobControllers } from './src/certification/session-management/jobs.js';
import { dbHistoryJobControllers } from './src/db-history/jobs.js';
import { identityAccessManagementJobControllers } from './src/identity-access-management/jobs.js';
import { learningContentJobControllers } from './src/learning-content/jobs.js';
import { legalDocumentsJobControllers } from './src/legal-documents/jobs.js';
import { llmJobControllers } from './src/llm/jobs.js';
import { maddoJobControllers } from './src/maddo/jobs.js';
import { campaignParticipationJobControllers } from './src/prescription/campaign-participation/jobs.js';
import { learnerManagementJobControllers } from './src/prescription/learner-management/jobs.js';
import { questJobControllers } from './src/quest/jobs.js';
import { sharedJobControllers } from './src/shared/jobs.js';
import { teamJobControllers } from './src/team/jobs.js';

/**
 * The job controllers and event handlers of each bounded context, keyed by the context folder under `src/`.
 * Each context lists its own in `src/<context>/jobs.js`; a controller missing from its list is never registered.
 * The documentation of the jobs (`JOBS.md`) is generated from this map by `npm run doc:jobs`.
 */
export const jobControllersByContext = {
  'certification/evaluation': certificationEvaluationJobControllers,
  'certification/session-management': certificationSessionManagementJobControllers,
  'db-history': dbHistoryJobControllers,
  'identity-access-management': identityAccessManagementJobControllers,
  'learning-content': learningContentJobControllers,
  'legal-documents': legalDocumentsJobControllers,
  llm: llmJobControllers,
  maddo: maddoJobControllers,
  'prescription/campaign-participation': campaignParticipationJobControllers,
  'prescription/learner-management': learnerManagementJobControllers,
  quest: questJobControllers,
  shared: sharedJobControllers,
  team: teamJobControllers,
};

/**
 * Every job controller and event handler the worker can run, across all bounded contexts.
 */
export const jobControllers = Object.values(jobControllersByContext).flat();
