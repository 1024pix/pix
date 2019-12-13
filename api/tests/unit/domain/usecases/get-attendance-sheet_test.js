const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const {
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  EXTRA_EMPTY_CANDIDATE_ROWS
} = require('../../../../lib/infrastructure/files/attendance-sheet/attendance-sheet-placeholders');
const writeOdsUtils = require('../../../../lib/infrastructure/utils/ods/write-ods-utils');
const readOdsUtils  = require('../../../../lib/infrastructure/utils/ods/read-ods-utils');
const sessionXmlService = require('../../../../lib/domain/services/session-xml-service');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', () => {

  let result;
  const userId = 'dummyUserId';
  const sessionId = 'dummySessionId';
  const sessionRepository = { getWithCertificationCandidates: _.noop, doesUserHaveCertificationCenterMembershipForSession: _.noop };

  const sessionWithCandidates = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '2018-01-16',
    time: '14:00:00',
    certificationCenter: 'Tour Gamma',
    certificationCandidates: [
      {
        lastName: 'Gouffre des Beignets',
        firstName: 'Jean',
        birthdate: '1985-05-20',
        birthCity: 'Loukoum City',
        externalId: 'ENT1234',
        extraTimePercentage: 0.5,
      },
      {
        lastName: 'Laifrui',
        firstName: 'Jaime',
        birthdate: '1975-11-04',
        birthCity: 'Minneapolis',
        externalId: 'ENT4567',
        extraTimePercentage: null,
      },
    ]
  };

  const attendanceSheetSessionData = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    certificationCenterName: 'Tour Gamma',
    startTime: '14:00',
    endTime: '16:00',
    date: '16/01/2018',
  };

  const attendanceSheetCandidatesData = [
    {
      count: 1,
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: '1985-05-20',
      birthCity: 'Loukoum City',
      externalId: 'ENT1234',
      extraTimePercentage: 0.5,
    },
    {
      count: 2,
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '1975-11-04',
      birthCity: 'Minneapolis',
      externalId: 'ENT4567',
      extraTimePercentage: '',
    },
  ];

  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateSheetData = {};
    _.each(ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES, (templateVal) => {
      emptyCandidateSheetData[templateVal.propertyName] = '';
    });
    emptyCandidateSheetData.count = attendanceSheetCandidatesData.length + 1;
    attendanceSheetCandidatesData.push(emptyCandidateSheetData);
  });

  const stringifiedXml = '<xml>Some xml</xml>';
  const stringifiedSessionUpdatedXml = '<xml>Some updated session xml</xml>';
  const stringifiedSessionAndCandidatesUpdatedXml = '<xml>Some updated session and candidates xml</xml>';
  const odsBuffer = Buffer.from('some ods file');

  describe('getAttendanceSheet', () => {
    beforeEach(async () => {
      // given
      sinon.stub(sessionRepository, 'getWithCertificationCandidates').resolves(sessionWithCandidates);
      sinon.stub(readOdsUtils, 'getContentXml').resolves(stringifiedXml);
      sinon.stub(writeOdsUtils, 'makeUpdatedOdsByContentXml').resolves(odsBuffer);
      sinon.stub(sessionXmlService, 'getUpdatedXmlWithSessionData').withArgs({ stringifiedXml, sessionData: attendanceSheetSessionData, sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES }).returns(stringifiedSessionUpdatedXml);
      sinon.stub(sessionXmlService, 'getUpdatedXmlWithCertificationCandidatesData').withArgs({ stringifiedXml: stringifiedSessionUpdatedXml, candidatesData: attendanceSheetCandidatesData, candidateTemplateValues: ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES }).returns(stringifiedSessionAndCandidatesUpdatedXml);
    });

    context('user has access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession').resolves(true);
        result = await getAttendanceSheet({ userId, sessionId, sessionRepository });
      });
      // then
      it('should return the attendance sheet', () => {
        expect(result).to.deep.equal(odsBuffer);
      });
      it('should have fetched the session with certification candidates', () => {
        expect(sessionRepository.getWithCertificationCandidates).to.have.been.calledWithExactly(sessionId);
      });
      it('should have build an updated content.xml file from attendance sheet data', () => {
        expect(sessionXmlService.getUpdatedXmlWithSessionData).to.have.been.calledWithExactly({ stringifiedXml, sessionData: attendanceSheetSessionData, sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES });
      });
      it('should have build an updated content.xml file from all attendance sheet candidates data', () => {
        expect(sessionXmlService.getUpdatedXmlWithCertificationCandidatesData).to.have.been.calledWith({ stringifiedXml: stringifiedSessionUpdatedXml, candidatesData: attendanceSheetCandidatesData, candidateTemplateValues: ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES });
      });
      it('should have rebuild the ods zip with new content.xml file', () => {
        expect(writeOdsUtils.makeUpdatedOdsByContentXml).to.have.been.calledWithExactly({ stringifiedXml: stringifiedSessionAndCandidatesUpdatedXml, odsFilePath: sinon.match('attendance_sheet_template.ods') });
      });
      it('should return something when user has access', async () => {
        expect(result).to.deep.equal(odsBuffer);
      });
    });

    context('user does not have access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession').resolves(false);
        try {
          result = await getAttendanceSheet({ userId, sessionId, sessionRepository });
        } catch (err) {
          result = err;
        }
      });

      it('should return an error when user does not have access', () => {
        expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });

  });

});
