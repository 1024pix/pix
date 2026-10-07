import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';

export const MESSAGE_ROLES = ['user', 'assistant'] as const;

export type MessageRole = (typeof MESSAGE_ROLES)[number];

export type MessageId = string;

type MessageParams = {
  id: MessageId;
  role: MessageRole;
  content: string;
};

export class Message {
  readonly id: MessageId;
  readonly role: MessageRole;
  readonly content: string;

  readonly #schema = Joi.object({
    id: Joi.string().required(),
    role: Joi.string()
      .valid(...MESSAGE_ROLES)
      .required(),
    content: Joi.string().allow('').required(),
  });

  constructor({ id, role, content }: MessageParams) {
    this.#validate({ id, role, content });

    this.id = id;
    this.role = role;
    this.content = content;
  }

  #validate(params: MessageParams): void {
    const { error } = this.#schema.validate(params, { abortEarly: false });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
