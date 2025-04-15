import { PassageEventInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { PassageEvent } from '../../../../../../src/devcomp/domain/models/passage-events/PassageEvent.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

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
            super({ id: 1, type: 'FAKE', passageId: 124, occurredAt: 'abcd' });
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
            super({ id: 1, type: 'FAKE', occurredAt: Symbol('date'), createdAt: Symbol('date') });
          }
        }

        // when
        const error = catchErrSync(() => new FakeEvent())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The passageId is required for a PassageEvent');
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
            super({ id: 1, type: 'FAKE', occurredAt: new Date(), passageId });
          }
        }

        // when
        const fakeEvent = new FakeEvent();

        // then
        expect(fakeEvent.passageId).to.deep.equal(passageId);
      });
    });

    describe('if a passage event has minimal required attributes', function () {
      it('should create a PassageEvent and set id attribute', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date('2025-04-27T15:02:00Z');
        const createdAt = Symbol('date');
        const passageId = 3;
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
        class FakeEvent extends PassageEvent {
          constructor() {
            super({ id, type: 'FAKE', occurredAt, createdAt, passageId });
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
