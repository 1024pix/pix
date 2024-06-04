import { config } from '../../../../config.js';
import { logInfoWithCorrelationIds } from '../../../monitoring-tools.js';

const { cpf } = config;
const sendEmail = async function ({ getPreSignedUrls, mailService }) {
  const generatedFiles = await getPreSignedUrls();

  if (generatedFiles.length) {
    await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
  } else {
    logInfoWithCorrelationIds(`No CPF exports files ready to send`);
  }
};

export { sendEmail };
