import { PassageEventInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { PassageEvent } from '../../../../../../src/devcomp/domain/models/passage-events/PassageEvent.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | PassageEvent', function () {
  describe('#constructor', function () {
    it('should not be able to create a PassageEvent directly', function () {
      // given & when
      const error = catchErrSync(() => new PassageEvent({}))();

      // then
      expect(error).to.be.instanceOf(PassageEventInstantiationError);
    });

    describe('if a passage event does not have a type', function () {
      it('should throw an error', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1 });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The type is required for a PassageEvent');
      });
    });

    describe('if a passage event does not have a occurredAt', function () {
      it('should throw an error', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1, type: 'FAKE' });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The occurredAt is required for a PassageEvent');
      });
    });

    describe('if a passage event has a occurredAt that is not a Date', function () {
      it('should throw an error', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1, type: 'FAKE', passageId: 124, occurredAt: 'abcd', sequenceNumber: 2 });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The occurredAt property should be a Date object');
      });
    });

    describe('if a passage event does not have a passageId', function () {
      it('should throw an error', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1, type: 'FAKE', occurredAt: new Date(), createdAt: Symbol('date') });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The passageId is required for a PassageEvent');
      });
    });

    describe('if a passage event does not have a sequenceNumber', function () {
      it('should throw an error', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({
              id: 1,
              type: 'FAKE',
              passageId: 124,
              occurredAt: new Date(),
              createdAt: Symbol('date'),
            });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The sequenceNumber is required for a PassageEvent');
      });
    });

    describe('#setPassageId', function () {
      it('should throw an error when passageId is a string', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({
              id: 1,
              type: 'FAKE',
              occurredAt: new Date(),
              createdAt: Symbol('date'),
              passageId: 'blablabla',
              sequenceNumber: 2,
            });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The passageId should be a number');
      });

      it('sets passageId when it is valid', function () {
        // given
        const passageId = 2;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1, type: 'FAKE', occurredAt: new Date(), passageId, sequenceNumber: 2 });
          }
        }

        // when
        const fakeEvent = new FakeEvent();

        // then
        expect(fakeEvent.passageId).to.deep.equal(passageId);
      });
    });

    describe('#setSequenceNumber', function () {
      it('should throw an error when sequenceNumber is a string', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({
              id: 1,
              type: 'FAKE',
              occurredAt: new Date(),
              createdAt: Symbol('date'),
              passageId: 123,
              sequenceNumber: '9',
            });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The sequenceNumber should be a number');
      });

      it('should throw an error when sequenceNumber < 0', function () {
        // given
        class FakeEvent extends PassageEvent {
          constructor() {
            super({
              id: 1,
              type: 'FAKE',
              occurredAt: new Date(),
              createdAt: Symbol('date'),
              passageId: 123,
              sequenceNumber: -12,
            });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The sequenceNumber should be a number higher than 0');
      });

      it('sets sequenceNumber when it is valid', function () {
        // given
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id: 1, type: 'FAKE', occurredAt: new Date(), passageId: 2, sequenceNumber });
          }
        }

        // when
        const fakeEvent = new FakeEvent();

        // then
        expect(fakeEvent.sequenceNumber).to.deep.equal(sequenceNumber);
      });
    });

    describe('if a passage event has minimal required attributes', function () {
      it('should create a PassageEvent and set id attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;

        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.id).to.equal(id);
      });

      it('should create a PassageEvent and set type attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.type).to.equal('FAKE');
      });

      it('should create a PassageEvent and set occurredAt attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.occurredAt).to.equal(occurredAt);
      });

      it('should create a PassageEvent and set createdAt attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.createdAt).to.equal(createdAt);
      });

      it('should create a PassageEvent and set passageId attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.passageId).to.equal(passageId);
      });

      it('should create a PassageEvent and set data to undefined', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        const sequenceNumber = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId, sequenceNumber });
          }
        }

        // when
        const event = new FakeEvent();

        // then
        expect(event.data).to.be.undefined;
      });
    });
  });
});
