import { certificationEvaluationJobControllers } from './src/certification/evaluation/jobs.js';
import { certificationResultsJobControllers } from './src/certification/results/jobs.js';
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
 * Every job controller and event handler the worker can run, across all bounded contexts.
 * Each context lists its own in `src/<context>/jobs.js`; a controller missing from its list is never registered.
 */
export const jobControllers = [
  ...certificationEvaluationJobControllers,
  ...certificationResultsJobControllers,
  ...certificationSessionManagementJobControllers,
  ...dbHistoryJobControllers,
  ...identityAccessManagementJobControllers,
  ...learningContentJobControllers,
  ...legalDocumentsJobControllers,
  ...llmJobControllers,
  ...maddoJobControllers,
  ...campaignParticipationJobControllers,
  ...learnerManagementJobControllers,
  ...questJobControllers,
  ...sharedJobControllers,
  ...teamJobControllers,
];
