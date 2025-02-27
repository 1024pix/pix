import { PassageCommand } from './PassageCommand.js';

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

export { TerminatePassageCommand };
