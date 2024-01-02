import { NotFoundError } from '../../../shared/domain/errors.js';
import { PassageDoesNotExistError } from '../errors.js';

async function verifyAndSaveAnswer({
  userResponse,
  elementId,
  passageId,
  passageRepository,
  moduleRepository,
  elementAnswerRepository,
}) {
  const passage = await _getPassage({ passageId, passageRepository });
  const module = await moduleRepository.getBySlugForVerification({ slug: passage.moduleId });
  const grain = module.getGrainByElementId(elementId);
  const element = grain.getElementById(elementId);
  element.validateUserResponseFormat(userResponse);

  const { correction, userResponseValue } = element.assess(userResponse);
  return await elementAnswerRepository.save({
    passageId,
    elementId,
    grainId: grain.id,
    value: userResponseValue,
    correction,
  });
}

async function _getPassage({ passageId, passageRepository }) {
  try {
    return await passageRepository.get({ passageId });
  } catch (e) {
    if (e instanceof NotFoundError) {
      throw new PassageDoesNotExistError();
    }
  }
}

export { verifyAndSaveAnswer };
