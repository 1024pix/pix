import { usecases } from '../../shared/domain/usecases/index.js';
import * as invigilatorKitPdf from '../infrastructure/utils/pdf/invigilator-kit-pdf.js';

const getInvigilatorKitPdf = async function (request, h, dependencies = { invigilatorKitPdf }) {
  const sessionId = request.params.id;
  const { userId } = request.auth.credentials;
  const lang = request.i18n.getLocale();
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
