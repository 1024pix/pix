const { expect, sinon } = require('../../../test-helper');
const getAttendanceSheet = require('../../../../lib/domain/usecases/get-attendance-sheet');
const JSZip = require('jszip');
const xmldom = require('xmldom');
const fs = require('fs');
const util = require('util');
const _ = require('lodash');

describe('Unit | UseCase | get-attendance-sheet-in-ods-format', () => {

  let result;
  const sessionId = 'dummySessionId';
  const sessionRepository = { get: _.noop };
  const session = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '2018-01-15',
    time: '14:00:00',
    certificationCenter: 'Tour Gamma',
  };

  const CURRENT_WORKING_DIRECTORY = 'current/working/directory';
  const parsedXmlDom = { getElementsByTagName: _.noop };
  const zipObject = { file: _.noop, generateAsync: _.noop };

  const contentXmlBufferCompressed = { async: _.noop };
  const contentXmlBufferUncompressed = Buffer.from('some uncompressed xml');
  const odsBuffer = Buffer.from('some ods file');

  const stringifiedContentXmlTemplate =
    '<xml>' +
      '<some:element>' +
        '<text:p>SESSION_ID</text:p>' +
        '<text:p>Some value</text:p>' +
        '<text:p>SESSION_ROOM</text:p>' +
        '<text:p>Some value</text:p>' +
      '</some:element>' +
      '<text:p>Some value</text:p>' +
      '<text:p>SESSION_EXAMINER</text:p>' +
    '</xml>';

  const updatedStringifiedXml =
    '<xml>' +
      '<some:element>' +
        '<text:p>1</text:p>' +
        '<text:p>Some value</text:p>' +
        '<text:p>Salle 2</text:p>' +
        '<text:p>Some value</text:p>' +
      '</some:element>' +
      '<text:p>Some value</text:p>' +
      '<text:p>Benoit</text:p>' +
    '</xml>';

  // Attention, remplacer par un Array-like
  const xmlDomElements = [
    { textContent: 'SESSION_ID' },
    { textContent: 'Some value' },
    { textContent: 'SESSION_ROOM' },
    { textContent: 'Some value' },
    { textContent: 'Some value' },
    { textContent: 'SESSION_EXAMINER' },
  ];

  describe('getAttendanceSheet', () => {
    beforeEach(async () => {

      // given
      sinon.stub(fs, 'readFile').resolves(stringifiedContentXmlTemplate);
      sinon.stub(JSZip.prototype, 'loadAsync').resolves(zipObject);
      sinon.stub(zipObject, 'file')
        .withArgs('content.xml').returns(contentXmlBufferCompressed)
        .withArgs('content.xml', updatedStringifiedXml).resolves();
      sinon.stub(contentXmlBufferCompressed, 'async').resolves(contentXmlBufferUncompressed);
      sinon.stub(process, 'cwd').returns(CURRENT_WORKING_DIRECTORY);
      sinon.stub(zipObject, 'generateAsync').returns(odsBuffer);
      sinon.stub(xmldom.DOMParser.prototype, 'parseFromString').returns(parsedXmlDom);
      sinon.stub(xmldom.XMLSerializer.prototype, 'serializeToString').returns(updatedStringifiedXml);
      sinon.stub(sessionRepository, 'get').returns(session);
      sinon.stub(parsedXmlDom, 'getElementsByTagName').returns(xmlDomElements);
      util.promisify = _.identity;

      // when
      result = await getAttendanceSheet({ sessionId, sessionRepository });
    });

    it('should return the attendance sheet', () => {
      // then
      expect(result.toString()).to.deep.equal('some ods file');
    });

  });

  describe('buildAttendanceSheetData', () => {

  });

});
