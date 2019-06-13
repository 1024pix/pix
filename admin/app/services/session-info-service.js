import Service from '@ember/service';
import json2csv from 'json2csv';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import moment from 'moment';
import XLSX from 'xlsx';

const competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2'
];

export default Service.extend({

  fileSaver: service(), // TODO ? convert into FileManager

  // TODO add tests
  async readSessionAttendanceSheet(attendanceSheetFile) {
    const arrayBuffer = await attendanceSheetFile.readAsArrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const headerRowsNumber = 8;
    const header = [
      'row',
      'lastName',
      'firstName',
      'birthdate',
      'birthplace',
      'email',
      'externalId',
      'extraTime',
      'signature',
      'certificationId',
      'lastScreen',
      'comments'
    ];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowsNumber, header });

    const lastRowIndex = jsonData.findIndex((row) => !row.lastName);
    const importedCandidates = jsonData.slice(0, lastRowIndex);
    importedCandidates.forEach((candidate) => {
      candidate.certificationId = candidate.certificationId.toString();
      if (candidate.birthdate instanceof Date) {
        candidate.birthdate = moment(candidate.birthdate).format('DD/MM/YYYY');
      } else {
        candidate.birthdate = null;
      }
    });
    return importedCandidates;
  },

  async updateCertificationsStatus(certifications, isPublished) {
    const promises = certifications.map((certification) => {
      certification.set('isPublished', isPublished);
      return certification.save({ adapterOptions: { updateMarks: false } });
    });

    await Promise.all(promises);
  },

  async updateCertificationsFromCandidatesData(certifications, candidatesData) {
    const candidatesCertificationIds = _.map(candidatesData, 'certificationId');
    const candidatesCertifications = certifications.filter((certification) => {
      return candidatesCertificationIds.includes(certification.id);
    });

    const updateRequests = candidatesCertifications.map((certification) => {

      function _updateCertificationFieldFromCandidateData(fieldName) {
        if (!_.isEmpty(candidateData[fieldName])) {
          certification.set(fieldName, candidateData[fieldName]);
        }
      }

      const candidateData = _.find(candidatesData, ['certificationId', certification.id]);
      _updateCertificationFieldFromCandidateData('firstName');
      _updateCertificationFieldFromCandidateData('lastName');
      _updateCertificationFieldFromCandidateData('birthdate');
      _updateCertificationFieldFromCandidateData('birthplace');
      _updateCertificationFieldFromCandidateData('externalId');
      return certification.save({ adapterOptions: { updateMarks: false } });
    });
    await Promise.all(updateRequests);
  },

  downloadSessionExportFile(session) {
    const data = _buildSessionExportFileData(session);
    const fileHeaders = _buildSessionExportFileHeaders();
    const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true });
    const fileName = 'resultats_session_' + session.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
    this.fileSaver.saveAs(csv + '\n', fileName);
  },

  downloadJuryFile(session, attendanceSheetCandidates) {
    const certificationsToBeReviewed = _getSessionCertificationsToBeReviewed(session.certifications, attendanceSheetCandidates);
    const data = _buildJuryFileData(certificationsToBeReviewed, attendanceSheetCandidates);
    const fileHeaders = _buildJuryFileHeaders();
    const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true, });
    const fileName = 'jury_session_' + session.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
    this.fileSaver.saveAs(`${csv}\n`, fileName);
  },

});

function _buildSessionExportFileHeaders() {
  return _.concat(
    [
      'Numéro de certification',
      'Prénom',
      'Nom',
      'Date de naissance',
      'Lieu de naissance',
      'Identifiant Externe',
      'Nombre de Pix'
    ],
    competenceIndexes,
    [
      'Session',
      'Centre de certification',
      'Date de passage de la certification'
    ]
  );
}

function _buildSessionExportFileData(session) {
  return session.certifications.map((certification) => {
    const rowItem = {};

    rowItem['Numéro de certification'] = certification.id;
    rowItem['Prénom'] = certification.firstName;
    rowItem['Nom'] = certification.lastName;
    rowItem['Date de naissance'] = certification.birthdate;
    rowItem['Lieu de naissance'] = certification.birthplace;
    rowItem['Identifiant Externe'] = certification.externalId;
    rowItem['Nombre de Pix'] = certification.pixScore;

    const certificationIndexedCompetences = certification.indexedCompetences;
    competenceIndexes.forEach((competence) => {
      if (!certificationIndexedCompetences[competence] || certificationIndexedCompetences[competence].level === 0 || certificationIndexedCompetences[competence].level === -1) {
        rowItem[competence] = '-';
      } else {
        rowItem[competence] = certificationIndexedCompetences[competence].level;
      }
    });

    rowItem['Session'] = session.id;
    rowItem['Centre de certification'] = session.certificationCenter;
    rowItem['Date de passage de la certification'] = certification.creationDate.substring(0, 10);

    return rowItem;
  });
}

function _getSessionCertificationsToBeReviewed(certifications, attendanceSheetCandidates) {
  const candidatesToBeReviewed = _.filter(attendanceSheetCandidates, (candidate) => {
    const hasCommentFromManager = !!candidate.comments && candidate.comments.trim() !== '';
    const didNotSeenEndScreen = !candidate.lastScreen || candidate.lastScreen.trim() === '';
    return hasCommentFromManager || didNotSeenEndScreen;
  });

  const certificationIdsOfCandidatesToBeReviewed = _.map(candidatesToBeReviewed, (candidate) => candidate.certificationId.trim());

  return certifications.filter((certification) => {
    const hasInvalidCandidate = _.includes(certificationIdsOfCandidatesToBeReviewed, certification.id);
    const hasInvalidStatus = certification.status !== 'validated';
    return hasInvalidCandidate || hasInvalidStatus;
  });
}

function _buildJuryFileHeaders() {
  return _.concat(
    [
      'ID de session',
      'ID de certification',
      'Statut de la certification',
      'Date de debut',
      'Date de fin',
      'Commentaire surveillant',
      'Commentaire pour le jury',
      'Ecran de fin non renseigné',
      'Note Pix'
    ],
    competenceIndexes
  );
}

function _buildJuryFileData(certifications, attendanceSheetCandidates) {
  return certifications.map((certification) => {
    const rowItem = {};
    const certificationCandidate = _.find(attendanceSheetCandidates, ['certificationId', certification.id]);

    let didNotSeeEndScreen = null;
    if (!certificationCandidate.lastScreen || certificationCandidate.lastScreen.trim() === '') {
      didNotSeeEndScreen = 'non renseigné';
    }

    rowItem['ID de session'] = certification.sessionId;
    rowItem['ID de certification'] = certification.id;
    rowItem['Statut de la certification'] = certification.status;
    rowItem['Date de debut'] = certification.creationDate;
    rowItem['Date de fin'] = certification.completionDate;
    rowItem['Commentaire surveillant'] = certificationCandidate.comments;
    rowItem['Commentaire pour le jury'] = certification.commentForJury;
    rowItem['Ecran de fin non renseigné'] = didNotSeeEndScreen;
    rowItem['Note Pix'] = certification.pixScore;

    const certificationIndexedCompetences = certification.indexedCompetences;
    competenceIndexes.forEach((competence) => {
      rowItem[competence] = certificationIndexedCompetences[competence] ? certificationIndexedCompetences[competence].level : '';
    });

    return rowItem;
  });

}
