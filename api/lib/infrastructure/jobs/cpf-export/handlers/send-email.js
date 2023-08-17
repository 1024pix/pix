import cronParser from 'cron-parser';

import { config } from '../../../../config.js';

const { cpf } = config;
const sendEmail = async function ({ cpfExternalStorage, mailService }) {
  const parsedCron = cronParser.parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' });
  const date = parsedCron.prev().toDate();

  const generatedFiles = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: date });

  await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
};

export { sendEmail };
