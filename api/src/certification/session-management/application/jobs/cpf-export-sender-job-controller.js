import { config } from '../../../../../config/config.js';
import { JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { mailService } from '../../../../shared/domain/services/mail-service.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../../domain/usecases/index.js';

const { cpf } = config;

class CpfExportSenderJobController extends JobScheduleController {
  constructor() {
    super('CpfExportSenderJob', {
      description:
        "Envoie périodiquement par email, au destinataire configuré, les liens de téléchargement des fichiers d'export CPF (Compte personnel de formation) générés et non encore transmis.",
      team: JobTeam.CERTIFICATION,
      jobCron: config.cpf.sendEmailJob.cron,
    });
  }

  get isJobEnabled() {
    return config.pgBoss.exportSenderJobEnabled;
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
