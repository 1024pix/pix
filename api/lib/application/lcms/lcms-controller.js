import { sharedUsecases as usecases } from '../../../src/shared/domain/usecases/index.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

const createRelease = async function (request, h) {
  usecases
    .createLcmsRelease()
    .then(() => {
      logger.info('Release created and cache reloaded');
    })
    .catch((e) => {
      logger.error('Error while creating the release and reloading cache', e);
    });
  return h.response({}).code(204);
};

const lcmsController = { createRelease };

export { lcmsController };
