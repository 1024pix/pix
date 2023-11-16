import { usecases } from '../../shared/domain/usecases/index.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

const getAttendanceSheet = async function (request, h, dependencies = { tokenService }) {
  const sessionId = request.params.id;
  const token = request.query.accessToken;
  const i18n = request.i18n;

  const userId = dependencies.tokenService.extractUserId(token);

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
