import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { ModuleDoesNotExistError } from '../errors.js';
import { PassageStartedEvent } from '../models/passage-events/passage-events.js';

const createPassage = withTransaction(async function ({
  moduleSlug,
  occurredAt,
  userId,
  moduleRepository,
  passageRepository,
  passageEventRepository,
  userRepository,
}) {
  const module = await _getModule({ slug: moduleSlug, moduleRepository });
  if (userId !== null) {
    await userRepository.get(userId);
  }

  const passage = await passageRepository.save({ moduleId: module.id, userId });
  await _recordPassageEvent({ module, occurredAt, passage, passageEventRepository });

  return passage;
});

async function _getModule({ slug, moduleRepository }) {
  try {
    return await moduleRepository.getBySlug({ slug });
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw new ModuleDoesNotExistError();
    }
    throw e;
  }
}

async function _recordPassageEvent({ module, occurredAt, passage, passageEventRepository }) {
  const { id: passageId } = passage;
  const contentHash = module.version;
  const passageStartedEvent = new PassageStartedEvent({ contentHash, passageId, occurredAt });

  await passageEventRepository.record(passageStartedEvent);
}

export { createPassage };
