import { config } from '../../../../config.js';
import cronParser from 'cron-parser';

const { cpf } = config;
const sendEmail = async function ({ getPreSignedUrls, mailService }) {
  const lastGeneratedFilesDate = cronParser
    .parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' })
    .prev()
    .toDate();

  const generatedFiles = await getPreSignedUrls({ date: lastGeneratedFilesDate });

  await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
};

export { sendEmail };
