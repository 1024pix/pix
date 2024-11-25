import Joi from 'joi';
import isUndefined from 'lodash/isUndefined.js';
import omitBy from 'lodash/omitBy.js';

const EmailSchema = Joi.object({
  template: Joi.string().optional(), // Should be required but empty on local env
  subject: Joi.string().required(),
  to: Joi.string().required(),
  from: Joi.string().required(),
  fromName: Joi.string().required(),
  variables: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

export class Email {
  constructor({ template, subject, to, from, fromName, variables, tags }) {
    this.template = template;
    this.subject = subject;
    this.to = to;
    this.from = from;
    this.fromName = fromName;
    this.variables = variables || {};
    this.tags = tags;

    Joi.attempt(this, EmailSchema, { abortEarly: false });
  }

  get payload() {
    return omitBy(
      {
        template: this.template,
        subject: this.subject,
        to: this.to,
        from: this.from,
        fromName: this.fromName,
        variables: this.variables,
        tags: this.tags,
      },
      isUndefined,
    );
  }
}
