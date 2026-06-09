import { BadRequestError } from '../../../shared/application/errors/http-errors.js';
import { DomainError } from '../../../shared/domain/errors.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as passageEventSerializer from '../../infrastructure/serializers/jsonapi/passage-event-serializer.js';

const create = async function (request, h, { usecases }) {
  try {
    const passageEvents = await passageEventSerializer.deserialize(request.payload);
    await usecases.recordPassageEvents({
      events: passageEvents,
      userId: extractUserIdFromRequest(request),
    });

    return h.response().code(204);
  } catch (error) {
    if (error instanceof DomainError) {
      throw new BadRequestError(error);
    }

    throw error;
  }
};

export const passageEventsController = { create };
