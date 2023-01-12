const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const {
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
  NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  EXTRA_EMPTY_CANDIDATE_ROWS,
} = require('../../../../lib/infrastructure/files/attendance-sheet/attendance-sheet-placeholders');
const writeOdsUtils = require('../../../../lib/infrastructure/utils/ods/write-ods-utils');
const readOdsUtils = require('../../../../lib/infrastructure/utils/ods/read-ods-utils');
const sessionXmlService = require('../../../../lib/domain/services/session-xml-service');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', function () {
  describe('getAttendanceSheet', function () {
    context('user has access to the session', function () {
      context('when certification center is not sco', function () {
        it('should return the attendance sheet without end test column', async function () {
          // given
          const userId = 'dummyUserId';
          const sessionId = 'dummySessionId';
          const stringifiedXml = '<xml>Some xml</xml>';
          const stringifiedSessionUpdatedXml = '<xml>Some updated session xml</xml>';
          const stringifiedSessionAndCandidatesUpdatedXml = '<xml>Some updated session and candidates xml</xml>';

          const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
          const sessionForAttendanceSheetRepository = { getWithCertificationCandidates: sinon.stub() };

          sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);
          sessionForAttendanceSheetRepository.getWithCertificationCandidates
            .withArgs(sessionId)
            .resolves(_buildSessionWithCandidate('SUP', true));

          const odsBuffer = Buffer.from('some ods file');
          sinon.stub(readOdsUtils, 'getContentXml').resolves(stringifiedXml);
          sinon
            .stub(writeOdsUtils, 'makeUpdatedOdsByContentXml')
            .withArgs({
              stringifiedXml: stringifiedSessionAndCandidatesUpdatedXml,
              odsFilePath: sinon.match('attendance_sheet_template.ods'),
            })
            .resolves(odsBuffer);
          sinon
            .stub(sessionXmlService, 'getUpdatedXmlWithSessionData')
            .withArgs({
              stringifiedXml,
              sessionData: _buildAttendanceSheetSessionData('SUP', true),
              sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
            })
            .returns(stringifiedSessionUpdatedXml);
          sinon
            .stub(sessionXmlService, 'getUpdatedXmlWithCertificationCandidatesData')
            .withArgs({
              stringifiedXml: stringifiedSessionUpdatedXml,
              candidatesData: _buildAttendanceSheetCandidateDataWithExtraRows('SUP'),
              candidateTemplateValues: NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
            })
            .returns(stringifiedSessionAndCandidatesUpdatedXml);

          // when
          const result = await getAttendanceSheet({
            userId,
            sessionId,
            sessionRepository,
            sessionForAttendanceSheetRepository,
          });

          // then
          expect(result).to.deep.equal(odsBuffer);
        });
      });

      context('when certification center is sco and managing students', function () {
        it('should return the sco attendance sheet without end test column', async function () {
          // given
          const userId = 'dummyUserId';
          const sessionId = 'dummySessionId';
          const stringifiedXml = '<xml>Some xml</xml>';
          const stringifiedSessionUpdatedXml = '<xml>Some updated session xml</xml>';
          const stringifiedSessionAndCandidatesUpdatedXml = '<xml>Some updated session and candidates xml</xml>';

          const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
          const sessionForAttendanceSheetRepository = { getWithCertificationCandidates: sinon.stub() };

          sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);
          sessionForAttendanceSheetRepository.getWithCertificationCandidates
            .withArgs(sessionId)
            .resolves(_buildSessionWithCandidate('SCO', true));

          const odsBuffer = Buffer.from('some ods file');
          sinon.stub(readOdsUtils, 'getContentXml').resolves(stringifiedXml);
          sinon
            .stub(writeOdsUtils, 'makeUpdatedOdsByContentXml')
            .withArgs({
              stringifiedXml: stringifiedSessionAndCandidatesUpdatedXml,
              odsFilePath: sinon.match('sco_attendance_sheet_template.ods'),
            })
            .resolves(odsBuffer);
          sinon
            .stub(sessionXmlService, 'getUpdatedXmlWithSessionData')
            .withArgs({
              stringifiedXml,
              sessionData: _buildAttendanceSheetSessionData('SCO', true),
              sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
            })
            .returns(stringifiedSessionUpdatedXml);
          sinon
            .stub(sessionXmlService, 'getUpdatedXmlWithCertificationCandidatesData')
            .withArgs({
              stringifiedXml: stringifiedSessionUpdatedXml,
              candidatesData: _buildAttendanceSheetCandidateDataWithExtraRows('SCO'),
              candidateTemplateValues: SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
            })
            .returns(stringifiedSessionAndCandidatesUpdatedXml);

          // when
          const result = await getAttendanceSheet({
            userId,
            sessionId,
            sessionRepository,
            sessionForAttendanceSheetRepository,
          });

          // then
          expect(result).to.deep.equal(odsBuffer);
        });
      });
    });

    context('user does not have access to the session', function () {
      let result;
      const userId = 'dummyUserId';
      const sessionId = 'dummySessionId';
      beforeEach(async function () {
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(false);
        try {
          result = await getAttendanceSheet({ userId, sessionId, sessionRepository });
        } catch (err) {
          result = err;
        }
      });

      it('should return an error', function () {
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

function _buildAttendanceSheetSessionData(certificationCenterType, isOrganizationManagingStudents) {
  return {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    certificationCenterName: 'Tour Gamma',
    certificationCenterType,
    isOrganizationManagingStudents,
    startTime: '14:00',
    endTime: '16:00',
    date: '16/01/2018',
  };
}

function _buildAttendanceSheetCandidateDataWithExtraRows(certificationCenterType) {
  const candidateTemplateValues =
    certificationCenterType === 'SCO'
      ? SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES
      : NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES;
  const attendanceSheetCandidatesData = [
    {
      count: 1,
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: '1985-05-20',
      birthCity: 'Loukoum City',
      externalId: 'ENT1234',
      division: '3B',
      extraTimePercentage: 0.5,
    },
    {
      count: 2,
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '1975-11-04',
      birthCity: 'Minneapolis',
      externalId: 'ENT4567',
      division: '3B',
      extraTimePercentage: '',
    },
  ];

  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateSheetData = {};
    _.each(candidateTemplateValues, (templateVal) => {
      emptyCandidateSheetData[templateVal.propertyName] = '';
    });
    emptyCandidateSheetData.count = attendanceSheetCandidatesData.length + 1;
    attendanceSheetCandidatesData.push(emptyCandidateSheetData);
  });

  return attendanceSheetCandidatesData;
}
