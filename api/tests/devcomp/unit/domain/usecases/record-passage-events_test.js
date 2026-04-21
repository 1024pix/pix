import sinon from 'sinon';

import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { FlashcardsVersoSeenEvent } from '../../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import { recordPassageEvents } from '../../../../../src/devcomp/domain/usecases/record-passage-events.js';
import { DomainError, NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | record-passage-events', function () {
  it('should call passage event repository to create the events', async function () {
    // given
    const flashcardsVersoSeenEvent = {
      occurredAt: new Date(),
      passageId: 2,
      sequenceNumber: 1,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
      type: 'FLASHCARDS_VERSO_SEEN',
    };

    const events = [flashcardsVersoSeenEvent];

    const passage = domainBuilder.devcomp.buildPassage({ id: 2 });
    const passageEventRepositoryStub = {
      record: sinon.stub().resolves(),
      getAllByPassageId: sinon.stub().resolves([]),
    };
    const passageRepositoryStub = {
      get: sinon.stub().resolves(passage),
    };

    // when
    await recordPassageEvents({
      events,
      userId: null,
      passageRepository: passageRepositoryStub,
      passageEventRepository: passageEventRepositoryStub,
    });

    // then
    const flashcardsVersoSeenPassageEvent = new FlashcardsVersoSeenEvent(flashcardsVersoSeenEvent);

    expect(passageEventRepositoryStub.record.getCall(0)).to.have.been.calledWithExactly(
      flashcardsVersoSeenPassageEvent,
    );
  });

  context('when there is no passage for given passage id', function () {
    it('should throw a NotFoundError', async function () {
      // given
      const event = {
        type: 'PASSAGE_STARTED',
        occurredAt: new Date(),
        sequenceNumber: 2,
        contentHash: 'abc',
        passageId: 123,
      };

      const passageRepositoryStub = {
        get: sinon.stub().withArgs({ passageId: 123 }).rejects(new NotFoundError()),
      };
      const passageEventRepositoryStub = {
        record: sinon.stub().resolves(),
      };

      // when
      const error = await catchErr(recordPassageEvents)({
        events: [event],
        userId: null,
        passageRepository: passageRepositoryStub,
        passageEventRepository: passageEventRepositoryStub,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(passageEventRepositoryStub.record).to.not.have.been.called;
    });
  });

  context('when the passage for given passage id is terminated', function () {
    context('when passageEvent is not "passage_terminated"', function () {
      it('should throw an error', async function () {
        // given
        const event = {
          type: 'PASSAGE_STARTED',
          occurredAt: new Date(),
          sequenceNumber: 2,
          contentHash: 'abc',
          passageId: 123,
        };

        const passageRepositoryStub = {
          get: sinon.stub().resolves(new Passage({ id: 123, terminatedAt: new Date() })),
        };
        const passageEventRepositoryStub = {
          record: sinon.stub().resolves(),
        };

        // when
        const error = await catchErr(recordPassageEvents)({
          events: [event],
          userId: null,
          passageRepository: passageRepositoryStub,
          passageEventRepository: passageEventRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal(`Passage with id ${event.id} is terminated.`);
        expect(passageEventRepositoryStub.record).to.not.have.been.called;
      });
    });

    context('when passageEvent is "passage_terminated"', function () {
      it('should not throw an error', async function () {
        // given
        const passageTerminatedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          type: 'PASSAGE_TERMINATED',
        };

        const events = [passageTerminatedEvent];

        const passage = domainBuilder.devcomp.buildPassage({ id: 2, terminatedAt: new Date() });
        const passageEventRepositoryStub = {
          record: sinon.stub().resolves(),
          getAllByPassageId: sinon.stub().resolves([]),
        };
        const passageRepositoryStub = {
          get: sinon.stub().resolves(passage),
        };

        // when
        const result = recordPassageEvents({
          events,
          userId: null,
          passageRepository: passageRepositoryStub,
          passageEventRepository: passageEventRepositoryStub,
        });

        // then
        await expect(result).to.not.be.rejectedWith(DomainError);
      });
    });
  });

  context('when anonymous user records an event for a passage with user id', function () {
    it('should throw an error', async function () {
      // given
      const passageTerminatedEvent = {
        occurredAt: new Date(),
        passageId: 2,
        sequenceNumber: 1,
        type: 'PASSAGE_TERMINATED',
      };
      const passageUser = { id: 123 };
      const passage = domainBuilder.devcomp.buildPassage({ id: 2, userId: passageUser.id });

      const passageRepositoryStub = {
        get: sinon.stub().withArgs({ userId: passageUser.id }).resolves(passage),
      };
      const passageEventRepositoryStub = {
        record: sinon.stub(),
      };

      // when
      const error = await catchErr(recordPassageEvents)({
        events: [passageTerminatedEvent],
        userId: null,
        passageRepository: passageRepositoryStub,
        passageEventRepository: passageEventRepositoryStub,
      });

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('Anonymous user cannot record event for passage with id 2 that belongs to a user');
    });
  });

  context('when passageEvent type is "passage_terminated"', function () {
    context('when sequenceNumber is not the highest among the events of this passage', function () {
      it('should throw an error', async function () {
        // given
        const passageTerminatedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 2,
          type: 'PASSAGE_TERMINATED',
        };

        const passageStartedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          type: 'PASSAGE_STARTED',
        };

        const passageNotTerminatedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_VERSO_SEEN',
        };

        const passage = domainBuilder.devcomp.buildPassage({ id: 2 });

        const passageRepositoryStub = {
          get: sinon.stub().withArgs({ passageId: 2 }).resolves(passage),
        };
        const passageEventRepositoryStub = {
          record: sinon.stub(),
          getAllByPassageId: sinon.stub().resolves([passageStartedEvent, passageNotTerminatedEvent]),
        };

        // when
        const error = await catchErr(recordPassageEvents)({
          events: [passageTerminatedEvent],
          userId: null,
          passageRepository: passageRepositoryStub,
          passageEventRepository: passageEventRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('Passage event of type terminated should have the highest sequence number');
      });
    });
  });

  context('when the user is connected', function () {
    context('when userId value in passage is null', function () {
      it('should throw an error', async function () {
        // given
        const passageTerminatedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          type: 'PASSAGE_TERMINATED',
        };
        const connectedUser = { id: 123 };
        const passage = domainBuilder.devcomp.buildPassage({ id: 2, userId: null });

        const passageRepositoryStub = {
          get: sinon.stub().withArgs({ userId: null }).resolves(passage),
        };
        const passageEventRepositoryStub = {
          record: sinon.stub(),
        };

        // when
        const error = await catchErr(recordPassageEvents)({
          events: [passageTerminatedEvent],
          userId: connectedUser,
          passageRepository: passageRepositoryStub,
          passageEventRepository: passageEventRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('Wrong userId');
      });
    });

    context('when userId value in passage does not match connected user', function () {
      it('should throw an error', async function () {
        // given
        const passageTerminatedEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          type: 'PASSAGE_TERMINATED',
        };
        const connectedUser = { id: 123 };
        const passageUserId = 321;
        const passage = domainBuilder.devcomp.buildPassage({ id: 2, userId: passageUserId });

        const passageRepositoryStub = {
          get: sinon.stub().withArgs({ userId: passageUserId }).resolves(passage),
        };
        const passageEventRepositoryStub = {
          record: sinon.stub(),
        };

        // when
        const error = await catchErr(recordPassageEvents)({
          events: [passageTerminatedEvent],
          userId: connectedUser,
          passageRepository: passageRepositoryStub,
          passageEventRepository: passageEventRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('Wrong userId');
      });
    });
  });
});
