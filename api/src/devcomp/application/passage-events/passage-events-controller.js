import { BadRequestError } from '../../../shared/application/http-errors.js';
import { DomainError } from '../../../shared/domain/errors.js';

const create = async function (request, h, { usecases, passageEventSerializer }) {
  try {
    const passageEvents = await passageEventSerializer.deserialize(request.payload);
    await usecases.recordPassageEvents({ events: passageEvents });

    return h.response().created();
  } catch (error) {
    if (error instanceof DomainError) {
      throw new BadRequestError(error);
    }

    throw error;
  }
};

const passageEventsController = { create };

export { passageEventsController };
