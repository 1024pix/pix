import { usecases } from '../domain/usecases/index.js';
import Stream from 'stream';
import * as sessionForSupervisingSerializer from '../infrastructure/serializers/session-for-supervising-serializer.js';

const get = async function (request) {
  const sessionId = request.params.sessionId;
  const session = await usecases.getSessionForSupervising({ sessionId });
  return sessionForSupervisingSerializer.serialize(session);
};

const supervisionEvents = async function (request, h) {
  const channel = new Stream.PassThrough;

  setInterval(async () => {

    const sessionId = request.params.sessionId;
    const session = await usecases.getSessionForSupervising({ sessionId });
    const response = JSON.stringify(sessionForSupervisingSerializer.serialize(session));
    channel.write(`data: ${response}\n\n`);

  }, 2000);
  return h.response(channel).code(200).type('text/event-stream').header('Connection', 'keep-alive').header('Cache-Control', 'no-cache');
};

const sessionForSupervisingController = { get, supervisionEvents };

export { sessionForSupervisingController };
