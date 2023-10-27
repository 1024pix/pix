import { config } from '../../../../config.js';
import cronParser from 'cron-parser';

const { cpf } = config;
const sendEmail = async function ({ getPreSignedUrls, mailService }) {
  const parsedCron = cronParser.parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' });
  const date = parsedCron.prev().toDate();

  const generatedFiles = await getPreSignedUrls.getPreSignedUrls({ date: date });

  await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
};

export { sendEmail };
