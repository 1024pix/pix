const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const odsService = require('../../../../lib/domain/services/ods-service');
const xmlService = require('../../../../lib/domain/services/xml-service');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', () => {

  let result;
  const userId = 'dummyUserId';
  const sessionId = 'dummySessionId';
  const sessionRepository = { get: _.noop, ensureUserHasAccessToSession: _.noop };
  const certificationCandidateRepository = { findBySessionId: () => undefined };

  const EXTRA_EMPTY_CANDIDATE_ROWS = 15;

  const ATTENDANCE_SHEET_TEMPLATE_VALUES = [
    {
      placeholder: 'SESSION_ID',
      propertyName: 'id',
    },
    {
      placeholder: 'SESSION_START_DATE',
      propertyName: 'date',
    },
    {
      placeholder: 'SESSION_START_TIME',
      propertyName: 'startTime',
    },
    {
      placeholder: 'SESSION_END_TIME',
      propertyName: 'endTime',
    },
    {
      placeholder: 'SESSION_ADDRESS',

      propertyName: 'address',
    },
    {
      placeholder: 'SESSION_ROOM',
      propertyName: 'room',
    },
    {
      placeholder: 'SESSION_EXAMINER',
      propertyName: 'examiner',
    },
    {
      placeholder: 'CERTIFICATION_CENTER_NAME',
      propertyName: 'certificationCenterName',
    },
  ];

  const ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES = [
    {
      placeholder: 'INCREMENT',
      propertyName: 'increment',
    },
    {
      placeholder: 'LAST_NAME',
      propertyName: 'lastName',
    },
    {
      placeholder: 'FIRST_NAME',
      propertyName: 'firstName',
    },
    {
      placeholder: '01/01/2001',
      propertyName: 'birthdate',
    },
    {
      placeholder: 'BIRTH_CITY',
      propertyName: 'birthCity',
    },
    {
      placeholder: 'EXTERNAL_ID',
      propertyName: 'externalId',
    },
    {
      placeholder: '777',
      propertyName: 'extraTimePercentage',
    },
  ];

  const session = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '15/01/2018',
    time: '14:00:00',
    certificationCenter: 'Tour Gamma',
  };

  const attendanceSheetData = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    certificationCenterName: 'Tour Gamma',
    startTime: '14:00',
    endTime: '16:00',
    date: '15/01/2018'
  };

  const candidatesInSession = [
    {
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: '20/05/1985',
      birthCity: 'Loukoum City',
      externalId: 'ENT1234',
      extraTimePercentage: 20,
    },
    {
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '04/11/1975',
      birthCity: 'Minneapolis',
      externalId: 'ENT4567',
      extraTimePercentage: 0,
    },
  ];

  const attendanceSheetCandidatesData = [
    {
      increment: 1,
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: '1985-05-20',
      birthCity: 'Loukoum City',
      externalId: 'ENT1234',
      extraTimePercentage: 20,
    },
    {
      increment: 2,
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '1975-11-04',
      birthCity: 'Minneapolis',
      externalId: 'ENT4567',
      extraTimePercentage: '',
    },
  ];

  let incrementCount = attendanceSheetCandidatesData.length + 1;
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateSheetData = {};
    _.each(ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES, (templateVal) => {
      emptyCandidateSheetData[templateVal.propertyName] = '';
    });
    emptyCandidateSheetData.increment = incrementCount;
    ++incrementCount;
    attendanceSheetCandidatesData.push(emptyCandidateSheetData);
  });

  const stringifiedXml = '<xml>Some xml</xml>';
  const stringifiedSessionUpdatedXml = '<xml>Some updated session xml</xml>';
  const stringifiedSessionAndCandidatesUpdatedXml = '<xml>Some updated session and candidates xml</xml>';
  const odsBuffer = Buffer.from('some ods file');

  describe('getAttendanceSheet', () => {
    beforeEach(async () => {
      // given
      sinon.stub(sessionRepository, 'get').resolves(session);
      sinon.stub(certificationCandidateRepository, 'findBySessionId').resolves(candidatesInSession);
      sinon.stub(odsService, 'getContentXml').resolves(stringifiedXml);
      sinon.stub(odsService, 'makeUpdatedOdsByContentXml').resolves(odsBuffer);
      sinon.stub(xmlService, 'getUpdatedXmlWithSessionData').withArgs({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES }).returns(stringifiedSessionUpdatedXml);
      sinon.stub(xmlService, 'getUpdatedXmlWithCertificationCandidatesData').withArgs({ stringifiedXml: stringifiedSessionUpdatedXml, candidatesDataToInject: attendanceSheetCandidatesData, templateValues: ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES }).returns(stringifiedSessionAndCandidatesUpdatedXml);
      result = await getAttendanceSheet({ userId, sessionId, sessionRepository, certificationCandidateRepository });
    });

    context('user has access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
        result = await getAttendanceSheet({ userId, sessionId, sessionRepository, certificationCandidateRepository });
      });
      // then
      it('should return the attendance sheet', () => {
        expect(result).to.deep.equal(odsBuffer);
      });
      it('should have fetched the session', () => {
        expect(sessionRepository.get).to.have.been.calledWithExactly(sessionId);
      });
      it('should have fetched the certification candidates in the session', () => {
        expect(certificationCandidateRepository.findBySessionId).to.have.been.calledWithExactly(sessionId);
      });
      it('should have build an updated content.xml file from attendance sheet data', () => {
        expect(xmlService.getUpdatedXmlWithSessionData).to.have.been.calledWithExactly({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES });
      });
      it('should have build an updated content.xml file from all attendance sheet candidates data', () => {
        expect(xmlService.getUpdatedXmlWithCertificationCandidatesData).to.have.been.calledWith({ stringifiedXml: stringifiedSessionUpdatedXml, candidatesDataToInject: attendanceSheetCandidatesData, templateValues: ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES });
      });
      it('should have rebuild the ods zip with new content.xml file', () => {
        expect(odsService.makeUpdatedOdsByContentXml).to.have.been.calledWithExactly({ stringifiedXml: stringifiedSessionAndCandidatesUpdatedXml, odsFilePath: sinon.match('attendance_sheet_template.ods') });
      });
      it('should return something when user has access', async () => {
        expect(result).to.deep.equal(odsBuffer);
      });
    });

    context('user does not have access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').rejects();
        try {
          result = await getAttendanceSheet({ userId, sessionId, sessionRepository, certificationCandidateRepository });
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
