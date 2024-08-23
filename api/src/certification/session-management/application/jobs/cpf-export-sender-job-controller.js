import { mailService } from '../../../../../lib/domain/services/mail-service.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../../shared/config.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../../domain/usecases/index.js';

const { cpf } = config;

class CpfExportSenderJobController extends JobScheduleController {
  constructor() {
    super('CpfExportSenderJob', { jobCron: config.cpf.sendEmailJob.cron });
  }

  async handle({ dependencies = { mailService } }) {
    const generatedFiles = await usecases.getPreSignedUrls();

    if (generatedFiles.length) {
      await dependencies.mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
    } else {
      logger.info(`No CPF exports files ready to send`);
    }
  }
}

export { CpfExportSenderJobController };
