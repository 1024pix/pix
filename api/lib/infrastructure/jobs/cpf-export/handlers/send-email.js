const { cpf } = require('../../../../config.js');
const cronParser = require('cron-parser');

module.exports = async function sendEmail({ cpfExternalStorage, mailService }) {
  const parsedCron = cronParser.parseExpression(cpf.plannerJob.cron, { tz: 'Europe/Paris' });
  const date = parsedCron.prev().toDate();

  const generatedFiles = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: date });

  await mailService.sendCpfEmail({ email: cpf.sendEmailJob.recipient, generatedFiles });
};
