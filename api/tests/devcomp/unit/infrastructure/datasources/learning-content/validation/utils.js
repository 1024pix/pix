import Joi from 'joi';
import { HtmlValidate } from 'html-validate';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required();

const proposalIdSchema = Joi.string().regex(/^\d+$/);

const htmlValidate = new HtmlValidate();
const severity = ['', 'Warning', 'Error'];
const htmlSchema = Joi.string()
  .external(async (value) => {
    const report = await htmlValidate.validateString(value);

    if (!report.valid) {
      let errorLog = '';
      errorLog = errorLog.concat('\n', `${report.errorCount} error(s), ${report.warningCount} warning(s)\n`);
      errorLog = errorLog.concat('\n', '─'.repeat(60));
      for (const result of report.results) {
        const line = result.source ?? '';
        for (const message of result.messages) {
          errorLog = errorLog.concat('\n');
          errorLog = errorLog.concat('\n', severity[message.severity], `(${message.ruleId}): `, message.message);
          errorLog = errorLog.concat('\n', message.ruleUrl);
          errorLog = errorLog.concat('\n');
          errorLog = errorLog.concat('\n', line);
          errorLog = errorLog.concat('\n');
          errorLog = errorLog.concat('\n', '─'.repeat(60));
          errorLog = errorLog.concat('\n');
        }
      }

      throw new Error(errorLog);
    }
  })
  .required();

export { uuidSchema, proposalIdSchema, htmlSchema };
