import { DomainError } from '../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import {
  FlashcardsCardAutoAssessedEvent,
  FlashcardsRectoReviewedEvent,
  FlashcardsRetriedEvent,
  FlashcardsStartedEvent,
  FlashcardsVersoSeenEvent,
} from '../models/passage-events/flashcard-events.js';

const recordPassageEvents = async function ({ events, passageEventRepository }) {
  const passageEvents = events.map(_buildPassageEvent);

  await PromiseUtils.mapSeries(passageEvents, (passageEvent) => passageEventRepository.record(passageEvent));
};

function _buildPassageEvent(event) {
  switch (event.type) {
    case 'FLASHCARDS_STARTED':
      return new FlashcardsStartedEvent(event);
    case 'FLASHCARDS_VERSO_SEEN':
      return new FlashcardsVersoSeenEvent(event);
    case 'FLASHCARDS_CARD_AUTO_ASSESSED':
      return new FlashcardsCardAutoAssessedEvent(event);
    case 'FLASHCARDS_RECTO_REVIEWED':
      return new FlashcardsRectoReviewedEvent(event);
    case 'FLASHCARDS_RETRIED':
      return new FlashcardsRetriedEvent(event);
    default:
      throw new DomainError(`Passage event with type ${event.type} does not exist`);
  }
}

export { recordPassageEvents };
