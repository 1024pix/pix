const moment = require('moment');
const { DOMParser, XMLSerializer } = require('xmldom');

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

module.exports = function insertSessionDataIntoXml({ stringifiedXml, session }) {
  const attendanceSheetData = buildAttendanceSheetData(session);

  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const updatedXmlDom = _updatedXmlDomWithSessionData(attendanceSheetData, parsedXmlDom);
  return _buildStringifiedXmlFromXmlDom(updatedXmlDom);
}

function buildAttendanceSheetData(session) {
  const attendanceSheetData = {};
  attendanceSheetData.certificationCenterName = session.certificationCenter;
  attendanceSheetData.date = moment(session.date).format('DD/MM/YYYY');
  const startTime = moment(session.time, 'HH:mm');
  attendanceSheetData.startTime = startTime.format('HH:mm');
  attendanceSheetData.endTime = startTime.add(moment.duration(2, 'hours')).format('HH:mm');
  return attendanceSheetData;
}

function _buildXmlDomFromXmlString(stringifiedXml) {
  return new DOMParser().parseFromString(stringifiedXml);
}

function _updatedXmlDomWithSessionData(attendanceSheetData, parsedXmlDom) {
  for (const templateValue of ATTENDANCE_SHEET_TEMPLATE_VALUE) {
    const targetXmlDomElement = _getXmlDomElementByText(parsedXmlDom, templateValue.placeholder);
    if (targetXmlDomElement) {
      const newAttendanceSheetValue = attendanceSheetData[templateValue.propertyName];
      targetXmlDomElement.textContent = newAttendanceSheetValue;
    }
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
