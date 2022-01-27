const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const AddedCellOption = require('../../infrastructure/utils/ods/added-cell-option');
// Placeholder in the template ODS file that helps us find the template candidate row in the file.
const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';
const INFORMATIVE_HEADER_ROW = 8;
const TABLE_HEADER_ROW = 11;
const TABLE_FIRST_ROW = 12;

function getUpdatedXmlWithSessionData({ stringifiedXml, sessionTemplateValues, sessionData }) {
  return writeOdsUtils.updateXmlSparseValues({
    stringifiedXml,
    templateValues: sessionTemplateValues,
    dataToInject: sessionData,
  });
}

function getUpdatedXmlWithCertificationCandidatesData({ stringifiedXml, candidateTemplateValues, candidatesData }) {
  return writeOdsUtils.updateXmlRows({
    stringifiedXml,
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: candidateTemplateValues,
    dataToInject: candidatesData,
  });
}

function addComplementaryCertificationColumns({ stringifiedXml, certificationCenterHabilitations }) {
  const habilitationColumnNames = certificationCenterHabilitations.map((habilitation) => habilitation.name);

  stringifiedXml = _addComplementaryCertificationOverallHeader({
    stringifiedXml,
    numberOfColumns: habilitationColumnNames.length,
  });

  stringifiedXml = habilitationColumnNames.reduce((stringifiedXml, habilitationColumnName) => {
    return _addComplementaryCertificationColumn(stringifiedXml, habilitationColumnName);
  }, stringifiedXml);

  return writeOdsUtils.incrementRowsColumnSpan({
    stringifiedXml,
    startLine: 0,
    endLine: INFORMATIVE_HEADER_ROW - 1,
    increment: habilitationColumnNames.length,
  });
}

function _addComplementaryCertificationOverallHeader({ stringifiedXml, numberOfColumns }) {
  let addedCellOption = new AddedCellOption({
    labels: ['Certification(s) complémentaire(s)'],
    rowspan: 3,
    positionOffset: 2,
  });

  if (numberOfColumns === 1) {
    addedCellOption = new AddedCellOption({
      labels: ['Certification(s)', 'complémentaire(s)'],
      rowspan: 3,
      colspan: 1,
      positionOffset: 2,
    });
  }

  stringifiedXml = writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
    stringifiedXml,
    lineNumber: INFORMATIVE_HEADER_ROW,
    cellToCopyLabel: '* Lieu de naissance',
    addedCellOption,
  });

  return stringifiedXml;
}

function _addComplementaryCertificationColumn(stringifiedXml, habilitationColumnName) {
  stringifiedXml = writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
    stringifiedXml,
    lineNumber: TABLE_HEADER_ROW,
    cellToCopyLabel: 'Temps majoré ?',
    addedCellOption: new AddedCellOption({ labels: [habilitationColumnName, '("oui" ou laisser vide)'] }),
  });

  return writeOdsUtils.addCellToEndOfLineWithStyleOfCellLabelled({
    stringifiedXml,
    lineNumber: TABLE_FIRST_ROW,
    cellToCopyLabel: 'EXTERNAL_ID',
    addedCellOption: new AddedCellOption({ labels: [habilitationColumnName] }),
  });
}

module.exports = {
  getUpdatedXmlWithSessionData,
  getUpdatedXmlWithCertificationCandidatesData,
  addComplementaryCertificationColumns,
};
