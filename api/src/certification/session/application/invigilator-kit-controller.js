import { usecases } from '../../shared/domain/usecases/index.js';
import { tokenService } from '../../../../lib/domain/services/token-service.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as invigilatorKitPdf from '../infrastructure/utils/pdf/invigilator-kit-pdf.js';

const getInvigilatorKitPdf = async function (
  request,
  h,
  dependencies = { tokenService, requestResponseUtils, invigilatorKitPdf },
) {
  const sessionId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const { lang } = request.query;
  const sessionForInvigilatorKit = await usecases.getInvigilatorKitSessionInfo({ sessionId, userId });

  const { buffer, fileName } = await dependencies.invigilatorKitPdf.getInvigilatorKitPdfBuffer({
    sessionForInvigilatorKit,
    lang,
  });

  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const invigilatorKitController = {
  getInvigilatorKitPdf,
};
export { invigilatorKitController };
