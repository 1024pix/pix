import { CpfExportBuilderJobController } from './application/jobs/cpf-export-builder-job-controller.js';
import { CpfExportPlannerJobController } from './application/jobs/cpf-export-planner-job-controller.js';
import { CpfExportSenderJobController } from './application/jobs/cpf-export-sender-job-controller.js';
import { PublishSessionJobController } from './application/publish-session-job-controller.js';
import { SendResultsToCleaPrescribersEventHandler } from './application/send-results-to-clea-prescribers.event-handler.js';
import { SendResultsToPrescribersEventHandler } from './application/send-results-to-prescribers.event-handler.js';

export const certificationSessionManagementJobControllers = [
  CpfExportBuilderJobController,
  CpfExportPlannerJobController,
  CpfExportSenderJobController,
  PublishSessionJobController,
  SendResultsToCleaPrescribersEventHandler,
  SendResultsToPrescribersEventHandler,
];
