import json2csv from 'json2csv';
import concat from 'lodash/concat';
import isEmpty from 'lodash/isEmpty';

import moment from 'moment';

import Service, { inject as service } from '@ember/service';

const competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

export default class SessionInfoServiceService extends Service {

  @service fileSaver;
  @service csvService;

  downloadJuryFile({ sessionId, certifications }) {
    const fileTitle = 'jury_session';
    const certificationsForJury = _filterCertificationsEligibleForJury(certifications);
    const data = this.buildJuryFileData(certificationsForJury);
    const fileHeaders = _buildJuryFileHeaders();
    const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true });
    const dateWithTime = moment();
    const fileName = _createFileNameWithDate(dateWithTime, fileTitle, sessionId);
    this.fileSaver.saveAs(`${csv}\n`, fileName);
  }

  buildSessionExportFileData({ session, certifications }) {
    return certifications.map((certification) => {
      const isCertifRejected = certification.status === 'rejected';
      const rowItem = {
        'Numéro de certification': certification.id,
        'Prénom': this.csvService.sanitize(certification.firstName),
        'Nom': this.csvService.sanitize(certification.lastName),
        'Date de naissance': moment(certification.birthdate).format('DD/MM/YYYY'),
        'Lieu de naissance': this.csvService.sanitize(certification.birthplace),
        'Identifiant Externe': this.csvService.sanitize(certification.externalId),
        'Nombre de Pix': !isCertifRejected ? certification.pixScore : '0',
        'Session': session.id,
        'Centre de certification': this.csvService.sanitize(session.certificationCenterName),
        'Date de passage de la certification': moment(certification.createdAt).format('DD/MM/YYYY'),
      };

      const certificationIndexedCompetences = certification.indexedCompetences;
      competenceIndexes.forEach((competenceIndex) => {
        const competenceValue = certificationIndexedCompetences[competenceIndex];
        const _competenceIsFailedOrCertifRejected = (competence) => competence.level === 0 || competence.level === -1 || isCertifRejected;
        if (!competenceValue) {
          rowItem[competenceIndex] = '-';
        } else if (_competenceIsFailedOrCertifRejected(competenceValue)) {
          rowItem[competenceIndex] = '0';
        } else {
          rowItem[competenceIndex] = competenceValue.level;
        }
      });

      return rowItem;
    });
  }

  buildJuryFileData(certifications) {
    return certifications.map((certification) => {
      const rowItem = {
        'ID de session': certification.sessionId,
        'ID de certification': certification.id,
        'Statut de la certification': certification.status,
        'Certification CléA numérique': certification.displayCleaCertificationStatus,
        'Date de debut': certification.creationDate,
        'Date de fin': certification.completionDate,
        'Signalement surveillant': this.csvService.sanitize(certification.examinerComment),
        'Commentaire pour le jury': this.csvService.sanitize(certification.commentForJury),
        'Ecran de fin non renseigné': certification.hasSeenEndTestScreen ? '' : 'non renseigné',
        'Note Pix': certification.pixScore,
      };

      const certificationIndexedCompetences = certification.indexedCompetences;
      competenceIndexes.forEach((competence) => {
        rowItem[competence] = certificationIndexedCompetences[competence] ? certificationIndexedCompetences[competence].level : '';
      });

      return rowItem;
    });
  }

}

function _filterCertificationsEligibleForJury(certifications) {
  return certifications.filter((certification) => {
    return (certification.status !== 'validated') || (!isEmpty(certification.examinerComment)) || !certification.hasSeenEndTestScreen;
  });
}

function _buildJuryFileHeaders() {
  return concat(
    [
      'ID de session',
      'ID de certification',
      'Statut de la certification',
      'Certification CléA numérique',
      'Date de debut',
      'Date de fin',
      'Signalement surveillant',
      'Commentaire pour le jury',
      'Ecran de fin non renseigné',
      'Note Pix',
    ],
    competenceIndexes,
  );
}

function _createFileNameWithDate(dateWithTime, fileTitle, sessionId) {
  return `${dateWithTime.format('YYYYMMDD_HHmm')}_${fileTitle}_${sessionId}.csv`;
}
