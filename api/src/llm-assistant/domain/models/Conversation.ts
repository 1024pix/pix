import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';
import { Message } from './Message.ts';

const GENERAL_INSTRUCTIONS = 'Tu es Pixelle, un assistant pour les équipes de Pix.';

type Day = string;

const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const endsOnAQuestion = (messages: Message[]) => messages.at(-1)?.role === 'user';

export type ConversationId = string;

type ConversationParams = {
  id: ConversationId;
  messages: Message[];
  today: Day;
};

export class Conversation {
  readonly id: ConversationId;
  readonly systemPrompt: string;
  readonly #messages: Message[];

  readonly #schema = Joi.object({
    id: Joi.string().required(),
    messages: Joi.array()
      .items(Joi.object().instance(Message))
      .min(1)
      .custom((messages: Message[], helpers) => (endsOnAQuestion(messages) ? messages : helpers.error('any.invalid')))
      .required(),
    today: Joi.string().pattern(DAY_FORMAT).required(),
  });

  constructor({ id, messages, today }: ConversationParams) {
    this.#validate({ id, messages, today });

    this.id = id;
    this.#messages = [...messages];
    this.systemPrompt = this.#assembleSystemPrompt(today);
  }

  get messages(): Message[] {
    return [...this.#messages];
  }

  #assembleSystemPrompt(today: Day): string {
    return [GENERAL_INSTRUCTIONS, `Date du jour : ${today}.`].join('\n');
  }

  #validate(params: ConversationParams): void {
    const { error } = this.#schema.validate(params, { abortEarly: false });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
