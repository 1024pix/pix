import { usecases } from '../../shared/domain/usecases/index.js';

const updateFromReceipts = async function (request, _h) {
  await usecases.integrateCpfProccessingReceipts();
  return _h.response({}).code(200);
};

export const udpdateCpfImportStatusController = { updateFromReceipts };
