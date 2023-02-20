import usecases from '../../domain/usecases';
import logger from '../../infrastructure/logger';

export default {
  async createRelease(request, h) {
    usecases
      .createLcmsRelease()
      .then(() => {
        logger.info('Release created and cache reloaded');
      })
      .catch((e) => {
        logger.error('Error while creating the release and reloading cache', e);
      });
    return h.response({}).code(204);
  },
};
