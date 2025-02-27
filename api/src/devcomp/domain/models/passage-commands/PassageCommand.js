import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { PassageCommandInstantiationError } from '../../errors.js';

/**
 * @abstract PassageCommand
 * A PassageCommand is an instruction that indicate a desired change in the state of a Modulix passage.
 * See CQRS pattern for more information.
 *
 * This is the base class for all PassageCommands. Sub classes should be named in present tense.
 *
 * It becomes a PassageEvent when saved to the DB.
 */
class PassageCommand {
  constructor({ type, occuredAt, passageId, commandData } = {}) {
    if (this.constructor === PassageCommand) {
      throw new PassageCommandInstantiationError();
    }

    assertNotNullOrUndefined(type, 'The type is required for a PassageCommand');
    assertNotNullOrUndefined(occuredAt, 'The occuredAt is required for a PassageCommand');
    assertNotNullOrUndefined(passageId, 'The passageId is required for a PassageCommand');

    this.type = type;
    this.occuredAt = occuredAt;
    this.passageId = passageId;
    this.commandData = commandData;
  }
}

export { PassageCommand };
