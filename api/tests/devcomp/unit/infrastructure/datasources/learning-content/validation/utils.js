import { HtmlValidate } from 'html-validate';
import Joi from 'joi';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required();

const proposalIdSchema = Joi.string().regex(/^\d+$/);

const htmlValidate = new HtmlValidate();
const htmlSchema = Joi.string().external(async (value, helpers) => {
  if (!value) {
    return;
  }

  const report = await htmlValidate.validateString(value);

  if (!report.valid) {
    return helpers.message('htmlvalidationerror', { value: report });
  }
});

const htmlNotAllowedSchema = Joi.string()
  .regex(/<.*?>/, { invert: true })
  .message('{{:#label}} failed custom validation because HTML is not allowed in this field');

export { htmlNotAllowedSchema, htmlSchema, proposalIdSchema, uuidSchema };
