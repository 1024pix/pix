import { cpf } from '../../../../config';
import cronParser from 'cron-parser';

export default async function sendEmail({ cpfExternalStorage, mailService }) {
  const parsedCron = cronParser.parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' });
  const date = parsedCron.prev().toDate();

  const generatedFiles = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: date });

  await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
}
