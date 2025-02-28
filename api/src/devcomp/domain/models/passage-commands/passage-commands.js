import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { PassageCommand } from './PassageCommand.js';

/**
 * @class StartPassageCommand
 *
 * A StartPassageCommand is an instruction to start a Modulix passage.
 * See CQRS pattern for more information.
 *
 * It becomes a PassageStartedEvent when saved to the DB.
 * It takes a contentHash as a parameter.
 */
class StartPassageCommand extends PassageCommand {
  constructor({ occuredAt, passageId, contentHash }) {
    super({ type: 'START_PASSAGE', occuredAt, passageId, commandData: { contentHash } });

    assertNotNullOrUndefined(contentHash, 'The contentHash is required for a StartPassageCommand');

    this.contentHash = contentHash;
  }
}

/**
 * @class TerminatePassageCommand
 *
 * A TerminatePassageCommand is an instruction to terminate a Modulix passage.
 * See CQRS pattern for more information.
 *
 * It becomes a PassageTerminatedEvent when saved to the DB.
 */
class TerminatePassageCommand extends PassageCommand {
  constructor({ occuredAt, passageId }) {
    super({ type: 'TERMINATE_PASSAGE', occuredAt, passageId });
  }
}

export { StartPassageCommand, TerminatePassageCommand };
