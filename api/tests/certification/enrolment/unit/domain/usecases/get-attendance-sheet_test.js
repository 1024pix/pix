import { expect } from 'chai';
import sinon from 'sinon';

import { getAttendanceSheet } from '../../../../../../src/certification/enrolment/domain/usecases/get-attendance-sheet.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-attendance-sheet', function () {
  describe('getAttendanceSheet', function () {
    describe('when no session is found', function () {
      it('throws a SessionNotFound error', async function () {
        // given
        const userId = 'dummyUserId';
        const i18n = 'dummyi18n';
        const sessionForAttendanceSheetRepository = { getWithCertificationCandidates: sinon.stub() };

        sessionForAttendanceSheetRepository.getWithCertificationCandidates.withArgs({ id: 1 }).resolves(null);

        const attendanceSheetPdfUtilsStub = {
          getAttendanceSheetPdfBuffer: sinon.stub(),
        };

        // when
        const error = await catchErr(getAttendanceSheet)({
          userId,
          sessionId: 1,
          i18n,
          sessionForAttendanceSheetRepository,
          attendanceSheetPdfUtils: attendanceSheetPdfUtilsStub,
        });

        // then
        expect(error).to.deepEqualInstance(
          new NotFoundError("La session n'existe pas ou aucun candidat n'est inscrit à celle-ci"),
        );
      });
    });

    it('should return the attendance sheet in pdf format', async function () {
      // given
      const userId = 'dummyUserId';
      const i18n = 'dummyi18n';
      const sessionForAttendanceSheetRepository = { getWithCertificationCandidates: sinon.stub() };
      const session = _buildSessionWithCandidate('SUP', true);

      sessionForAttendanceSheetRepository.getWithCertificationCandidates.withArgs({ id: 1 }).resolves(session);

      const pdfBuffer = Buffer.from('some pdf file');
      const fileName = 'attendance-sheet-example.pdf';

      const attendanceSheetPdfUtilsStub = {
        getAttendanceSheetPdfBuffer: sinon.stub(),
      };
      attendanceSheetPdfUtilsStub.getAttendanceSheetPdfBuffer
        .withArgs({ session, i18n })
        .resolves({ attendanceSheet: pdfBuffer, fileName });

      // when
      const { attendanceSheet, fileName: expectedFileName } = await getAttendanceSheet({
        userId,
        sessionId: 1,
        i18n,
        sessionForAttendanceSheetRepository,
        attendanceSheetPdfUtils: attendanceSheetPdfUtilsStub,
      });

      // then
      expect(attendanceSheet).to.deep.equal(pdfBuffer);
      expect(expectedFileName).to.equal('attendance-sheet-example.pdf');
    });
  });
});

function _buildSessionWithCandidate(certificationCenterType, isOrganizationManagingStudents) {
  return {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '2018-01-16',
    time: '14:00:00',
    certificationCenterName: 'Tour Gamma',
    certificationCenterType,
    isOrganizationManagingStudents,
    certificationCandidates: [
      {
        lastName: 'Gouffre des Beignets',
        firstName: 'Jean',
        birthdate: '1985-05-20',
        birthCity: 'Loukoum City',
        externalId: 'ENT1234',
        division: '3B',
        extraTimePercentage: 0.5,
      },
      {
        lastName: 'Laifrui',
        firstName: 'Jaime',
        birthdate: '1975-11-04',
        birthCity: 'Minneapolis',
        externalId: 'ENT4567',
        division: '3B',
        extraTimePercentage: null,
      },
    ],
  };
}
