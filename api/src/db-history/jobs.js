import { ScheduleExportMigratedUserKnowledgeElementsJobController } from './application/jobs/schedule-export-migrated-user-knowledge-elements-job-controller.js';
import { ScheduleHistorizeAnswersJobController } from './application/jobs/schedule-historize-answers-job-controller.js';
import { SchedulePurgeMigratedUserKnowledgeElementsJobController } from './application/jobs/schedule-purge-migrated-user-knowledge-elements-job-controller.ts';

export const dbHistoryJobControllers = [
  ScheduleExportMigratedUserKnowledgeElementsJobController,
  ScheduleHistorizeAnswersJobController,
  SchedulePurgeMigratedUserKnowledgeElementsJobController,
];
