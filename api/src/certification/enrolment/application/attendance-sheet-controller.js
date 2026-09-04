import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';

async function getAttendanceSheet(request, h) {
  const sessionId = request.params.sessionId;
  const { userId } = request.auth.credentials;

  const i18n = getI18nFromRequest(request);

  const { attendanceSheet, fileName } = await usecases.getAttendanceSheet({ sessionId, userId, i18n });
  return h
    .response(attendanceSheet)
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
}

export const attendanceSheetController = {
  getAttendanceSheet,
};
