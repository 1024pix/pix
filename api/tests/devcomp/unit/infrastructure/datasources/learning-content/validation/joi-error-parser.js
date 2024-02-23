export const joiErrorParser = {
  format(error) {
    const objectErrorSeparator = `\n${'─'.repeat(60)}\n`;
    const visualSeparator = `\n${'='.repeat(60)}\n`;
    return `${visualSeparator}${error.details
      .map(
        (error) =>
          `\nError: ${error.message}.\nValeur concernée à rechercher : ${JSON.stringify(error.context.value)}\n`,
      )
      .join(objectErrorSeparator)}${visualSeparator}`;
  },
};
