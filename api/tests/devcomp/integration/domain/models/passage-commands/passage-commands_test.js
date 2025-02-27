import { TerminatePassageCommand } from '../../../../../../src/devcomp/domain/models/passage-commands/passage-commands.js';
import { expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | passage-commands | passage-commands', function () {
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
