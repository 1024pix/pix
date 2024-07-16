import { config } from '../../../../../src/shared/config.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';

const { cpf } = config;
const sendEmail = async function ({ getPreSignedUrls, mailService }) {
  const generatedFiles = await getPreSignedUrls();

  if (generatedFiles.length) {
    await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
  } else {
    logger.info(`No CPF exports files ready to send`);
  }
};

export { sendEmail };
