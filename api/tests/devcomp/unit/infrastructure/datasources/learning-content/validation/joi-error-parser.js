export const joiErrorParser = {
  format(error) {
    const severity = ['', 'Warning', 'Error'];
    const visualSeparator = `\n${'='.repeat(60)}\n`;
    const objectErrorSeparator = `\n${'─'.repeat(60)}\n`;

    return `${visualSeparator}${error.details
      .map((errorDetail) => {
        if (errorDetail.type === 'external') {
          const report = errorDetail.context.value;
          const errorLogs = [];
          for (const result of report.results) {
            const line = result.source ?? '';
            for (const message of result.messages) {
              let errorLog = '';
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
        } else {
          return `\nError: ${errorDetail.message}.\nValeur concernée à rechercher : ${JSON.stringify(
            errorDetail.context.value,
          )}\n`;
        }
      })
      .join(objectErrorSeparator)}${visualSeparator}`;
  },
};
