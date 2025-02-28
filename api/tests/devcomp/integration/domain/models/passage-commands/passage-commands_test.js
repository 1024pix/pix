import {
  StartPassageCommand,
  TerminatePassageCommand,
} from '../../../../../../src/devcomp/domain/models/passage-commands/passage-commands.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | passage-commands | passage-commands', function () {
  describe('#StartPassageCommand', function () {
    it('should init and keep attributes', function () {
      // given
      const occuredAt = Symbol('date');
      const passageId = Symbol('passage');
      const contentHash = Symbol('contentHash');

      // when
      const startPassageCommand = new StartPassageCommand({ occuredAt, passageId, contentHash });

      // then
      expect(startPassageCommand.type).to.equal('START_PASSAGE');
      expect(startPassageCommand.occuredAt).to.equal(occuredAt);
      expect(startPassageCommand.passageId).to.equal(passageId);
      expect(startPassageCommand.contentHash).to.equal(contentHash);
      expect(startPassageCommand.commandData).to.deep.equal({ contentHash });
    });

    describe('when contentHash is not given', function () {
      it('should throw an error', function () {
        // given
        const occuredAt = Symbol('date');
        const passageId = Symbol('passage');

        // when
        const error = catchErrSync(() => new StartPassageCommand({ occuredAt, passageId }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The contentHash is required for a StartPassageCommand');
      });
    });
  });

  describe('#TerminatePassageCommand', function () {
    it('should init and keep attributes', function () {
      // given
      const occuredAt = Symbol('date');
      const passageId = Symbol('passage');

      // when
      const terminatePassageCommand = new TerminatePassageCommand({ occuredAt, passageId });

      // then
      expect(terminatePassageCommand.type).to.equal('TERMINATE_PASSAGE');
      expect(terminatePassageCommand.occuredAt).to.equal(occuredAt);
      expect(terminatePassageCommand.passageId).to.equal(passageId);
      expect(terminatePassageCommand.commandData).to.be.undefined;
    });
  });
});
