export const joiErrorParser = {
  format(error) {
    const visualSeparator = `\n${'='.repeat(60)}\n`;
    const objectErrorSeparator = `\n${'─'.repeat(60)}\n`;

    return `${visualSeparator}${error.details
      .map((errorDetail) => {
        if (errorDetail.type === 'external') {
          return logHtmlErrors(errorDetail, objectErrorSeparator);
        } else {
          return logSchemaErrors(errorDetail);
        }
      })
      .join(objectErrorSeparator)}${visualSeparator}`;
  },
};

function logHtmlErrors(errorDetail, objectErrorSeparator) {
  const severity = ['', 'Warning', 'Error'];
  const report = errorDetail.context.value;
  const errorLogs = [];
  for (const result of report.results) {
    const line = result.source ?? '';
    for (const message of result.messages) {
      let errorLog = '';
      errorLog = errorLog.concat('\n');
      errorLog = errorLog.concat('\nChemin : ', errorDetail.context.label);
      errorLog = errorLog.concat('\n');
      errorLog = errorLog.concat('\n', severity[message.severity], `(${message.ruleId}): `, message.message);
      errorLog = errorLog.concat('\n', message.ruleUrl);
      errorLog = errorLog.concat('\n');
      errorLog = errorLog.concat('\n', 'Valeur concernée à rechercher :\n', line);
      errorLog = errorLog.concat('\n');
      errorLogs.push(errorLog);
    }
  }
  return errorLogs.join(objectErrorSeparator);
}

function logSchemaErrors(errorDetail) {
  let errorLog = '';
  errorLog = errorLog.concat('\n');
  errorLog = errorLog.concat(`Error: ${errorDetail.message}.`);
  errorLog = errorLog.concat('\n');
  errorLog = errorLog.concat(`Valeur concernée à rechercher : ${JSON.stringify(errorDetail.context.value)}`);
  errorLog = errorLog.concat('\n');
  return errorLog;
}
