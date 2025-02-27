import { PassageCommandInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { PassageCommand } from '../../../../../../src/devcomp/domain/models/passage-commands/PassageCommand.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | PassageCommand', function () {
  describe('#constructor', function () {
    it('should not be able to create a PassageCommand directly', function () {
      // given & when
      const error = catchErrSync(() => new PassageCommand({}))();

      // then
      expect(error).to.be.instanceOf(PassageCommandInstantiationError);
    });

    describe('if a passage command does not have a type', function () {
      it('should throw an error', function () {
        // given
        class FakeCommand extends PassageCommand {
          constructor() {
            super({});
          }
        }

        // when
        const error = catchErrSync(() => new FakeCommand())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The type is required for a PassageCommand');
      });
    });

    describe('if a passage command does not have a occuredAt', function () {
      it('should throw an error', function () {
        // given
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE' });
          }
        }

        // when
        const error = catchErrSync(() => new FakeCommand())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The occuredAt is required for a PassageCommand');
      });
    });

    describe('if a passage command does not have a passageId', function () {
      it('should throw an error', function () {
        // given
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE', occuredAt: Symbol('date') });
          }
        }

        // when
        const error = catchErrSync(() => new FakeCommand())();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The passageId is required for a PassageCommand');
      });
    });

    describe('if a passage command has minimal required attributes', function () {
      it('should create a PassageCommand and set type attribute', function () {
        // given
        const occuredAt = Symbol('date');
        const passageId = Symbol('passage');
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE', occuredAt, passageId });
          }
        }

        // when
        const command = new FakeCommand();

        // then
        expect(command.type).to.equal('FAKE');
      });

      it('should create a PassageCommand and set occuredAt attribute', function () {
        // given
        const occuredAt = Symbol('date');
        const passageId = Symbol('passage');
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE', occuredAt, passageId });
          }
        }

        // when
        const command = new FakeCommand();

        // then
        expect(command.occuredAt).to.equal(occuredAt);
      });

      it('should create a PassageCommand and set passageId attribute', function () {
        // given
        const occuredAt = Symbol('date');
        const passageId = Symbol('passage');
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE', occuredAt, passageId });
          }
        }

        // when
        const command = new FakeCommand();

        // then
        expect(command.passageId).to.equal(passageId);
      });

      it('should create a PassageCommand and set commandData to undefined', function () {
        // given
        const occuredAt = Symbol('date');
        const passageId = Symbol('passage');
        class FakeCommand extends PassageCommand {
          constructor() {
            super({ type: 'FAKE', occuredAt, passageId });
          }
        }

        // when
        const command = new FakeCommand();

        // then
        expect(command.commandData).to.be.undefined;
      });
    });
  });
});
