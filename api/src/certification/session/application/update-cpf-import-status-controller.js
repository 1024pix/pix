import { usecases } from '../../shared/domain/usecases/index.js';

const updateFromReceipts = async function (request, _h) {
  usecases.integrateCpfProccessingReceipts();
  return _h.response({}).code(200);
};

export const udpdateCpfImportStatusController = { updateFromReceipts };
