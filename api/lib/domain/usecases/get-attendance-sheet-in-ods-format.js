const util = require('util');
const fs = require('fs');
const moment = require('moment');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('xmldom');

const CONTENT_XML_PATH_IN_ODS = 'content.xml';
const ODS_PATH = process.cwd() + '/lib/domain/files/template.ods';

const ATTENDANCE_SHEET_TEMPLATE_VALUE = [
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

module.exports = getAttendanceSheet;

async function getAttendanceSheet({ sessionId, sessionRepository }) {
  const session = await sessionRepository.get(sessionId);
  const attendanceSheetData = buildAttendanceSheetData(session);

  return _getUpdatedOdsBuffer(attendanceSheetData);
}

function buildAttendanceSheetData(session) {
  const attendanceSheetData = {};
  session.certificationCenterName = session.certificationCenter;
  session.date = moment(session.date).format('DD/MM/YYYY');
  const startTime = moment(session.time, 'HH:mm');
  session.startTime = startTime.format('HH:mm');
  session.endTime = startTime.add(moment.duration(2, 'hours')).format('HH:mm');
  return attendanceSheetData;
}

async function _getUpdatedOdsBuffer(attendanceSheetData) {
  const stringifiedUpdatedXml = await _computeUpdatedContentXmlFile(attendanceSheetData);
  const updatedOdsBuffer = await _buildUpdatedOdsFile(stringifiedUpdatedXml);
  return updatedOdsBuffer;
}

async function _computeUpdatedContentXmlFile(attendanceSheetData) {
  const stringifiedXml = await _extractXmlFromOdsFile(CONTENT_XML_PATH_IN_ODS);
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const updatedXmlDom = _updatedXmlDomWithSessionData(attendanceSheetData, parsedXmlDom);
  return _buildStringifiedXmlFromXmlDom(updatedXmlDom);
}

async function _extractXmlFromOdsFile() {
  const zip = await _loadOdsTemplate();
  const contentXmlBufferCompressed = zip.file('content.xml');
  const uncompressedBuffer = await contentXmlBufferCompressed.async('nodebuffer');
  return Buffer.from(uncompressedBuffer, 'utf8').toString();
}

function _buildXmlDomFromXmlString(stringifiedXml) {
  return new DOMParser().parseFromString(stringifiedXml);
}

function _updatedXmlDomWithSessionData(attendanceSheetData, parsedXmlDom) {
  for (const templateValue of ATTENDANCE_SHEET_TEMPLATE_VALUE) {
    const targetXmlDomElement = _getXmlDomElementByText(parsedXmlDom, templateValue.placeholder);
    const newAttendanceSheetValue = attendanceSheetData[templateValue.propertyName];
    targetXmlDomElement.textContent = newAttendanceSheetValue;
  }
  return parsedXmlDom;
}

function _getXmlDomElementByText(parsedXmlDom, text) {
  for (const xmlDomElement of Array.from(parsedXmlDom.getElementsByTagName('text:p'))) {
    if (xmlDomElement.textContent === text) {
      return xmlDomElement;
    }
  }
}

function _buildStringifiedXmlFromXmlDom(parsedXmlDom) {
  return new XMLSerializer().serializeToString(parsedXmlDom);
}

async function _buildUpdatedOdsFile(stringifiedXml) {
  const zip = await _loadOdsTemplate();
  await zip.file(CONTENT_XML_PATH_IN_ODS, stringifiedXml);
  const odsBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  
  return odsBuffer;
}

async function _loadOdsTemplate() {
  const odsFileData = await _readOdsFile(ODS_PATH);
  const zip = JSZip();
  return await zip.loadAsync(odsFileData);
}

async function _readOdsFile(odsFilePath) {
  return await util.promisify(fs.readFile)(odsFilePath);
}
