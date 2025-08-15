import * as injectedPassageRepository from '../../infrastructure/repositories/passage-repository.js';
import { UserModuleStatus } from '../models/module/UserModuleStatus.js';

async function getUserModuleStatuses({ userId, moduleIds, passageRepository = injectedPassageRepository } = {}) {
  const passages = await passageRepository.findAllByUserIdAndModuleIds({ userId, moduleIds });
  const passagesModuleId = _groupPassagesByModuleId({ passages, moduleIds });

  const result = passagesModuleId.keys().map(
    (moduleId) =>
      new UserModuleStatus({
        moduleId,
        userId,
        passages: passagesModuleId.get(moduleId),
      }),
  );
  return Array.from(result);
}

function _groupPassagesByModuleId({ passages, moduleIds }) {
  const result = new Map();

  moduleIds.forEach((moduleId) => {
    result.set(moduleId, []);
  });

  passages.forEach((passage) => {
    const passagesWithModuleId = result.get(passage.moduleId);
    result.set(passage.moduleId, [...passagesWithModuleId, passage]);
  });

  return result;
}

export { getUserModuleStatuses };
