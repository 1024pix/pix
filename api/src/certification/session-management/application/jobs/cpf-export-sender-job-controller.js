import { mailService } from '../../../../../lib/domain/services/mail-service.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../shared/config.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { getPreSignedUrls } from '../../domain/usecases/get-cpf-presigned-urls.js';

const { cpf } = config;

class CpfExportSenderJobController extends JobController {
  constructor() {
    super('CpfExportSenderJob');
  }

  async handle(data, { dependencies = { getPreSignedUrls, mailService } }) {
    const generatedFiles = await dependencies.getPreSignedUrls();

    if (generatedFiles.length) {
      await dependencies.mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
    } else {
      logger.info(`No CPF exports files ready to send`);
    }
  }
}

export { CpfExportSenderJobController };
