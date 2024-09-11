import { usecases } from '../domain/usecases/index.js';

const getAttendanceSheet = async function (request, h) {
  const sessionId = request.params.sessionId;
  const { userId } = request.auth.credentials;
  const i18n = request.i18n;

  const { attendanceSheet, fileName } = await usecases.getAttendanceSheet({ sessionId, userId, i18n });
  return h
    .response(attendanceSheet)
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
};

const attendanceSheetController = {
  getAttendanceSheet,
};
export { attendanceSheetController };
