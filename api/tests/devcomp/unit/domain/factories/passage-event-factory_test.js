import { expect } from 'chai';

import { PassageEventFactory } from '../../../../../src/devcomp/domain/factories/passage-event-factory.js';
import {
  CustomDraftRetriedEvent,
  CustomRetriedEvent,
  EmbedAnsweredEvent,
  EmbedRetriedEvent,
  QCMAnsweredEvent,
  QCMDeclarativeAnsweredEvent,
  QCMRetriedEvent,
  QCUAnsweredEvent,
  QCUDeclarativeAnsweredEvent,
  QCUDiscoveryAnsweredEvent,
  QCURetriedEvent,
  QROCMAnsweredEvent,
  QROCMRetriedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/answerable-element-events.js';
import {
  AudioPlayedEvent,
  AudioTranscriptionOpenedEvent,
  ExpandClosedEvent,
  ExpandOpenedEvent,
  FileDownloadedEvent,
  ImageAlternativeTextOpenedEvent,
  ShortVideoTranscriptionOpenedEvent,
  VideoPlayedEvent,
  VideoTranscriptionOpenedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/events.js';
import {
  FlashcardsCardAutoAssessedEvent,
  FlashcardsRectoReviewedEvent,
  FlashcardsRetriedEvent,
  FlashcardsStartedEvent,
  FlashcardsVersoSeenEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import {
  GrainContinuedEvent,
  GrainSkippedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/grain-events.js';
import {
  PassageStartedEvent,
  PassageTerminatedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/passage-events.js';
import {
  QABCardAnsweredEvent,
  QABRetriedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/qab-events.js';
import { StepperNextStepEvent } from '../../../../../src/devcomp/domain/models/passage-events/stepper-events.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockInput', function () {
  describe('#build', function () {
    describe('when given an event with unknown type', function () {
      it('should return a DomainError with correct message', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'UNKNOWN',
        };

        // when
        const error = catchErrSync(PassageEventFactory.build)(rawEvent);

        // then
        expect(error).to.be.instanceof(DomainError);
        expect(error.message).to.equal('Passage event with type UNKNOWN does not exist');
      });
    });

    describe('when given an AUDIO_PLAYED', function () {
      it('should return an AudioPlayedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 102,
          sequenceNumber: 34,
          elementId: '1e3940ef-c557-415d-b5ef-6f9f77b527f4',
          type: 'AUDIO_PLAYED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(AudioPlayedEvent);
      });
    });

    describe('when given an AUDIO_TRANSCRIPTION_OPENED', function () {
      it('should return an AudioTranscriptionOpenedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 102,
          sequenceNumber: 34,
          elementId: '46eaf84c-eac8-4cb5-b984-4307dde46ea7',
          type: 'AUDIO_TRANSCRIPTION_OPENED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(AudioTranscriptionOpenedEvent);
      });
    });

    describe('when given a CUSTOM_DRAFT_RETRIED event', function () {
      it('should return a CustomDraftRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'CUSTOM_DRAFT_RETRIED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(CustomDraftRetriedEvent);
      });
    });

    describe('when given an CUSTOM_RETRIED event', function () {
      it('should return a CustomRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'CUSTOM_RETRIED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(CustomRetriedEvent);
      });
    });

    describe('when given a EXPAND_CLOSED event', function () {
      it('should return an ExpandClosedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 10,
          sequenceNumber: 34,
          elementId: 'f905e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'EXPAND_CLOSED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(ExpandClosedEvent);
      });
    });

    describe('when given an EMBED_ANSWERED event', function () {
      it('should return a EmbedAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'EMBED_ANSWERED',
          answer: 'Courgette',
          status: 'ok',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(EmbedAnsweredEvent);
      });
    });

    describe('when given an EMBED_RETRIED event', function () {
      it('should return a EmbedRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'EMBED_RETRIED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(EmbedRetriedEvent);
      });
    });

    describe('when given a FLASHCARDS_AUTO_ASSESSED event', function () {
      it('should return a FlashcardsAutoAssessedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
          autoAssessment: 'yes',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsCardAutoAssessedEvent);
      });
    });

    describe('when given a FLASHCARDS_RECTO_REVIEWED event', function () {
      it('should return a FlashcardsRectoReviewedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_RECTO_REVIEWED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsRectoReviewedEvent);
      });
    });

    describe('when given a FLASHCARDS_RETRIED event', function () {
      it('should return a FlashcardsRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          type: 'FLASHCARDS_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsRetriedEvent);
      });
    });

    describe('when given a FLASHCARDS_STARTED event', function () {
      it('should return a FlashcardsStartedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          type: 'FLASHCARDS_STARTED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsStartedEvent);
      });
    });

    describe('when given a FLASHCARDS_VERSO_SEEN event', function () {
      it('should return a FlashcardsVersoSeenEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_VERSO_SEEN',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsVersoSeenEvent);
      });
    });

    describe('when given a GRAIN_CONTINUED event', function () {
      it('should return a GrainContinuedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          grainId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'GRAIN_CONTINUED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(GrainContinuedEvent);
      });
    });

    describe('when given a GRAIN_SKIPPED event', function () {
      it('should return a GrainContinuedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          grainId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'GRAIN_SKIPPED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(GrainSkippedEvent);
      });
    });

    describe('when given a STEPPER_NEXT_STEP event', function () {
      it('should return a StepperNextStepEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          grainId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          stepNumber: 1,
          type: 'STEPPER_NEXT_STEP',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(StepperNextStepEvent);
      });
    });

    describe('when given a PASSAGE_STARTED event', function () {
      it('should return a PassageStartedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'PASSAGE_STARTED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(PassageStartedEvent);
      });
    });

    describe('when given a PASSAGE_TERMINATED event', function () {
      it('should return a PassageTerminatedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'PASSAGE_TERMINATED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(PassageTerminatedEvent);
      });
    });

    describe('when given a QAB_CARD_ANSWERED event', function () {
      it('should return a QabCardAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QAB_CARD_ANSWERED',
          cardId: '34b916b9-9103-4060-818d-98b2dc67111d',
          answer: 'A',
          status: 'ko',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QABCardAnsweredEvent);
      });
    });

    describe('when given a QAB_RETRIED event', function () {
      it('should return a QabRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QAB_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QABRetriedEvent);
      });
    });

    describe('when given a QCM_ANSWERED event', function () {
      it('should return a QCMAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCM_ANSWERED',
          answer: ['2', '3', '4'],
          status: 'ok',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCMAnsweredEvent);
      });
    });

    describe('when given a QCM_DECLARATIVE_ANSWERED event', function () {
      it('should return a QCMDeclarativeAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCM_DECLARATIVE_ANSWERED',
          answer: '1,3',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCMDeclarativeAnsweredEvent);
      });
    });

    describe('when given a QCU_ANSWERED event', function () {
      it('should return a QCUAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCU_ANSWERED',
          answer: 'Poire',
          status: 'ok',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCUAnsweredEvent);
      });
    });

    describe('when given a QCU_RETRIED event', function () {
      it('should return a QcuRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCU_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCURetriedEvent);
      });
    });

    describe('when given a QCM_RETRIED event', function () {
      it('should return a QcmRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCM_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCMRetriedEvent);
      });
    });

    describe('when given a QROCM_RETRIED event', function () {
      it('should return a QrocmRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QROCM_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QROCMRetriedEvent);
      });
    });

    describe('when given a QROCM_ANSWERED event', function () {
      it('should return a QCUAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QROCM_ANSWERED',
          answer: 'Framboise',
          status: 'ok',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QROCMAnsweredEvent);
      });
    });

    describe('when given a QCU_DECLARATIVE_ANSWERED event', function () {
      it('should return a QCUDeclarativeAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCU_DECLARATIVE_ANSWERED',
          answer: 'Tous les mercredis',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCUDeclarativeAnsweredEvent);
      });
    });

    describe('when given a QCU_DISCOVERY_ANSWERED event', function () {
      it('should return a QCUDiscoveryAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCU_DISCOVERY_ANSWERED',
          answer: 'Poire',
          status: 'ok',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCUDiscoveryAnsweredEvent);
      });
    });

    describe('when given an IMAGE_ALTERNATIVE_TEXT_OPENED event', function () {
      it('should return an ImageAlternativeTextOpenedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'IMAGE_ALTERNATIVE_TEXT_OPENED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(ImageAlternativeTextOpenedEvent);
      });
    });

    describe('when given an SHORT_VIDEO_TRANSCRIPTION_OPENED event', function () {
      it('should return a ShortVideoTranscriptionOpened instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'SHORT_VIDEO_TRANSCRIPTION_OPENED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(ShortVideoTranscriptionOpenedEvent);
      });
    });

    describe('when given an VIDEO_TRANSCRIPTION_OPENED event', function () {
      it('should return an VideoTranscriptionOpened instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'VIDEO_TRANSCRIPTION_OPENED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(VideoTranscriptionOpenedEvent);
      });
    });

    describe('when given an VIDEO_PLAYED event', function () {
      it('should return an VideoPlayed instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'VIDEO_PLAYED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(VideoPlayedEvent);
      });
    });

    describe('when given a FILE_DOWNLOADED event', function () {
      it('should return an FileDownloadedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 9,
          sequenceNumber: 34,
          elementId: 'd905e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'FILE_DOWNLOADED',
          filename: 'my-file.pdf',
          format: '.pdf',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FileDownloadedEvent);
      });
    });

    describe('when given a EXPAND_OPENED event', function () {
      it('should return an ExpandOpenedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 9,
          sequenceNumber: 34,
          elementId: 'd905e7c9-327e-4be5-9c62-ce4627b85f44',
          type: 'EXPAND_OPENED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(ExpandOpenedEvent);
      });
    });
  });
});
