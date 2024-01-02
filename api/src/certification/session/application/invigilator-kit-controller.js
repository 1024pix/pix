import { usecases } from '../../shared/domain/usecases/index.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as invigilatorKitPdf from '../infrastructure/utils/pdf/invigilator-kit-pdf.js';

const getInvigilatorKitPdf = async function (request, h, dependencies = { requestResponseUtils, invigilatorKitPdf }) {
  const sessionId = request.params.id;
  const { userId } = request.auth.credentials;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const sessionForInvigilatorKit = await usecases.getInvigilatorKitSessionInfo({ sessionId, userId });

  const { buffer, fileName } = await dependencies.invigilatorKitPdf.getInvigilatorKitPdfBuffer({
    sessionForInvigilatorKit,
    lang: locale,
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
