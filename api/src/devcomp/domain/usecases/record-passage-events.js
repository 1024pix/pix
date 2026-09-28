import { DomainError } from '../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { PassageEventFactory } from '../factories/passage-event-factory.js';

const recordPassageEvents = async function ({ events, userId, passageRepository, passageEventRepository }) {
  await PromiseUtils.mapSeries(events, async (event) => {
    const passageEvent = PassageEventFactory.build(event);
    await _validatePassage({ event, userId, passageRepository, passageEventRepository });
    await passageEventRepository.record(passageEvent);
  });
};

async function _validatePassage({ event, userId, passageRepository, passageEventRepository }) {
  const passage = await passageRepository.get({ passageId: event.passageId });

  if (passage.terminatedAt != null && event.type !== 'PASSAGE_TERMINATED') {
    throw new DomainError(`Passage with id ${event.id} is terminated.`);
  }

  if (userId === null && passage.userId !== null) {
    throw new DomainError(
      `Anonymous user cannot record event for passage with id ${passage.id} that belongs to a user`,
    );
  }

  if (userId && userId !== passage.userId) {
    throw new DomainError('Wrong userId');
  }

  if (event.type !== 'PASSAGE_TERMINATED') {
    return;
  }

  const highestSequenceNumber = await passageEventRepository.getHighestSequenceNumberForPassageId({
    passageId: event.passageId,
  });

  if (highestSequenceNumber >= event.sequenceNumber) {
    throw new DomainError('Passage event of type terminated should have the highest sequence number');
  }
}

export { recordPassageEvents };
