import { config } from '../../../../config.js';
import cronParser from 'cron-parser';
import { logger } from '../../../logger.js';

const { cpf } = config;
const sendEmail = async function ({ getPreSignedUrls, mailService }) {
  const lastGeneratedFilesDate = cronParser
    .parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' })
    .prev()
    .toDate();

  const generatedFiles = await getPreSignedUrls({ date: lastGeneratedFilesDate });

  if (generatedFiles.length) {
    await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
  } else {
    logger.info(`No new generated cpf files since ${lastGeneratedFilesDate}`);
  }
};

export { sendEmail };
