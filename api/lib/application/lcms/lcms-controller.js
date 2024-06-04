import { usecases } from '../../domain/usecases/index.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../infrastructure/monitoring-tools.js';

const createRelease = async function (request, h) {
  usecases
    .createLcmsRelease()
    .then(() => {
      logInfoWithCorrelationIds('Release created and cache reloaded');
    })
    .catch((e) => {
      logErrorWithCorrelationIds('Error while creating the release and reloading cache', e);
    });
  return h.response({}).code(204);
};

const lcmsController = { createRelease };

export { lcmsController };
