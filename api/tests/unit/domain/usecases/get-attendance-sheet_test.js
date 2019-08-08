const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const odsService = require('../../../../lib/domain/services/ods-service');
const sessionXmlService = require('../../../../lib/domain/services/session-xml-service');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', () => {

  let result;
  const userId = 'dummyUserId';
  const sessionId = 'dummySessionId';
  const sessionRepository = { get: _.noop, ensureUserHasAccessToSession: _.noop };

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

  const session = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '2018-01-16',
    time: '14:00:00',
    certificationCenter: 'Tour Gamma',
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

  const stringifiedXml = '<xml>Some xml</xml>';
  const stringifiedSessionUpdatedXml = '<xml>Some updated session xml</xml>';
  const odsBuffer = Buffer.from('some ods file');

  describe('getAttendanceSheet', () => {
    beforeEach(async () => {
      // given
      sinon.stub(sessionRepository, 'get').resolves(session);
      sinon.stub(odsService, 'getContentXml').resolves(stringifiedXml);
      sinon.stub(odsService, 'makeUpdatedOdsByContentXml').resolves(odsBuffer);
      sinon.stub(sessionXmlService, 'getUpdatedXmlWithSessionData').withArgs({ stringifiedXml, sessionData: attendanceSheetSessionData, sessionTemplateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES }).returns(stringifiedSessionUpdatedXml);
    });

    context('user has access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
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
        expect(sessionXmlService.getUpdatedXmlWithSessionData).to.have.been.calledWithExactly({ stringifiedXml, sessionData: attendanceSheetSessionData, sessionTemplateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES });
      });
      it('should have rebuild the ods zip with new content.xml file', () => {
        expect(odsService.makeUpdatedOdsByContentXml).to.have.been.calledWithExactly({ stringifiedXml: stringifiedSessionUpdatedXml, odsFilePath: sinon.match('attendance_sheet_template.ods') });
      });
      it('should return something when user has access', async () => {
        expect(result).to.deep.equal(odsBuffer);
      });
    });

    context('user does not have access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').rejects();
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
