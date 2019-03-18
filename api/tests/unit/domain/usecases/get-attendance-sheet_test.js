const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const odsService = require('../../../../lib/domain/services/ods-service');
const xmlService = require('../../../../lib/domain/services/xml-service');
const _ = require('lodash');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', () => {

  let result;
  const sessionId = 'dummySessionId';
  const sessionRepository = { get: _.noop };

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
    date: '2018-01-15',
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

  const stringifiedXml = '<xml>Some xml</xml>';
  const stringifiedUpdatedXml = '<xml>Some updated xml</xml>';
  const odsBuffer = Buffer.from('some ods file');
  const currentWorkingDirectory = 'current/working/directory';
  const attendanceTemplatePath = currentWorkingDirectory + '/lib/domain/files/attendance_sheet_template.ods';

  describe('getAttendanceSheet', () => {
    beforeEach(async () => {
      // given
      sinon.stub(process, 'cwd').returns(currentWorkingDirectory);
      sinon.stub(sessionRepository, 'get').returns(session);
      sinon.stub(odsService, 'getContentXml').resolves(stringifiedXml);
      sinon.stub(odsService, 'makeUpdatedOdsByContentXml').resolves(odsBuffer);
      sinon.stub(xmlService, 'getUpdatedXml').returns(stringifiedUpdatedXml);

      // when
      result = await getAttendanceSheet({ sessionId, sessionRepository });
    });
    // then
    it('should return the attendance sheet', () => {
      expect(result).to.deep.equal(odsBuffer);
    });
    it('should have retrieved the content.xml file from ods zip', () => {
      expect(odsService.getContentXml).to.have.been.calledWithExactly({ odsFilePath: attendanceTemplatePath });
    });
    it('should have fetched the session', () => {
      expect(sessionRepository.get).to.have.been.calledWithExactly(sessionId);
    });
    it('should have build an updated content.xml file from attendance sheet data', () => {
      expect(xmlService.getUpdatedXml).to.have.been.calledWithExactly({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES });
    });
    it('should have rebuild the ods zip with new content.xml file', () => {
      expect(odsService.makeUpdatedOdsByContentXml).to.have.been.calledWithExactly({ stringifiedXml: stringifiedUpdatedXml, odsFilePath: attendanceTemplatePath });
    });
  });

});
