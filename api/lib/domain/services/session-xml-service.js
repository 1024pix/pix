const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const AddedCellOption = require('../../infrastructure/utils/ods/added-cell-option');
// Placeholder in the template ODS file that helps us find the template candidate row in the file.

const INFORMATIVE_HEADER_ROW = 8;
const TABLE_HEADER_ROW = 11;
const TABLE_FIRST_ROW = 12;
const GROUP_HEADER_ROW_HEIGHT_ROW_SPAN = 3;

function getUpdatedXmlWithSessionData({ odsBuilder, sessionTemplateValues, sessionData }) {
  return odsBuilder.withData(sessionData, sessionTemplateValues);
}

function getUpdatedXmlWithCertificationCandidatesData({ odsBuilder, candidateTemplateValues, candidatesData }) {
  return odsBuilder.updateXmlRows({
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: candidateTemplateValues,
    dataToInject: candidatesData,
  });
}

// function addColumnGroup({ odsBuilder, groupHeaderLabel, columns }) {
//   _addColumnGroupHeader({
//     odsBuilder,
//     headerLabel: groupHeaderLabel,
//     numberOfColumns: columns.length,
//   });

//   stringifiedXml = columns.reduce(_addColumn, stringifiedXml);

//   return writeOdsUtils.incrementRowsColumnSpan({
//     stringifiedXml,
//     startLine: 0,
//     endLine: INFORMATIVE_HEADER_ROW - 1,
//     increment: columns.length,
//   });
// }

// function _addColumnGroupHeader({ stringifiedXml, headerLabel, numberOfColumns }) {
//   const headerLabelWords = headerLabel.split(' ');

//   let addedCellOption = new AddedCellOption({
//     labels: [headerLabel],
//     rowspan: GROUP_HEADER_ROW_HEIGHT_ROW_SPAN,
//     colspan: numberOfColumns,
//     positionOffset: 2,
//   });

//   if (numberOfColumns === 1) {
//     addedCellOption = new AddedCellOption({
//       labels: headerLabelWords,
//       rowspan: GROUP_HEADER_ROW_HEIGHT_ROW_SPAN,
//       colspan: numberOfColumns,
//       positionOffset: 2,
//     });
//   }

//   stringifiedXml = writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
//     stringifiedXml,
//     lineNumber: INFORMATIVE_HEADER_ROW,
//     cellToCopyLabel: '* Lieu de naissance',
//     addedCellOption,
//   });

//   return stringifiedXml;
// }

// function _addColumn(stringifiedXml, column) {
//   stringifiedXml = writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
//     stringifiedXml,
//     lineNumber: TABLE_HEADER_ROW,
//     cellToCopyLabel: 'Temps majoré ?',
//     addedCellOption: new AddedCellOption({ labels: column.headerLabel }),
//   });

//   return writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
//     stringifiedXml,
//     lineNumber: TABLE_FIRST_ROW,
//     cellToCopyLabel: 'EXTERNAL_ID',
//     addedCellOption: new AddedCellOption({ labels: column.placeholder }),
//   });
// }

module.exports = {
  getUpdatedXmlWithSessionData,
  getUpdatedXmlWithCertificationCandidatesData,
};
