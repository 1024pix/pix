import { randomUUID } from 'node:crypto';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

import { Conversation } from '../../../domain/models/Conversation.ts';
import { Message } from '../../../domain/models/Message.ts';

const PIX_TIME_ZONE = 'Europe/Paris';

const currentDay = () => dayjs().tz(PIX_TIME_ZONE).format('YYYY-MM-DD');

const textOf = function (parts) {
  return parts
    .filter(({ type, text }) => type === 'text' && typeof text === 'string')
    .map(({ text }) => text)
    .join('');
};

const contentOf = function ({ content, parts }) {
  if (Array.isArray(parts)) {
    return textOf(parts);
  }

  if (Array.isArray(content)) {
    return textOf(content);
  }

  return content;
};

const deserialize = function (payload, today = currentDay()) {
  const messages = payload.messages.map(
    (message) => new Message({ id: message.id ?? randomUUID(), role: message.role, content: contentOf(message) }),
  );

  return new Conversation({ id: payload.id ?? randomUUID(), messages, today });
};

export { deserialize };
