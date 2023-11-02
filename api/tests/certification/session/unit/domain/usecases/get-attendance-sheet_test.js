import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { getAttendanceSheet } from '../../../../../../src/certification/session/domain/usecases/get-attendance-sheet.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | get-attendance-sheet', function () {
  describe('getAttendanceSheet', function () {
    context('user has access to the session', function () {
      it('should return the attendance sheet in pdf format', async function () {
        // given
        const userId = 'dummyUserId';
        const i18n = 'dummyi18n';
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        const sessionForAttendanceSheetRepository = { getWithCertificationCandidates: sinon.stub() };
        const session = _buildSessionWithCandidate('SUP', true);

        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);
        sessionForAttendanceSheetRepository.getWithCertificationCandidates.withArgs(1).resolves(session);

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
          sessionRepository,
          sessionForAttendanceSheetRepository,
          attendanceSheetPdfUtils: attendanceSheetPdfUtilsStub,
        });

        // then
        expect(attendanceSheet).to.deep.equal(pdfBuffer);
        expect(expectedFileName).to.equal('attendance-sheet-example.pdf');
      });
    });

    context('user does not have access to the session', function () {
      it('should return an error', async function () {
        // given
        const userId = 'dummyUserId';
        const sessionId = 'dummySessionId';
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(false);

        // when
        const result = await catchErr(getAttendanceSheet)({ userId, sessionId, sessionRepository });

        // then
        expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
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
