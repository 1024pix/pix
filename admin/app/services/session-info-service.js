import Service, { inject as service } from '@ember/service';
import json2csv from 'json2csv';
import _ from 'lodash';
import moment from 'moment';

const competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2'
];

export default Service.extend({

  fileSaver: service(),
  csvService: service(),

  async updateCertificationsStatus(certifications, isPublished) {
    const promises = certifications.map((certification) => {
      certification.set('isPublished', isPublished);
      return certification.save({ adapterOptions: { updateMarks: false } });
    });

    await Promise.all(promises);
  },

  downloadSessionExportFile(session) {
    const data = this.buildSessionExportFileData(session);
    const fileHeaders = _buildSessionExportFileHeaders();
    const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true });
    const sessionDateTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
    const { day, month, year, hour, minute } = {
      day: sessionDateTime.format('DD'),
      month: sessionDateTime.format('MM'),
      year: sessionDateTime.format('YYYY'),
      hour: sessionDateTime.format('HH'),
      minute: sessionDateTime.format('mm'),
    };
    const fileName = `${year}${month}${day}_${hour}${minute}_resultats_session_${session.id}.csv`;
    this.fileSaver.saveAs(csv + '\n', fileName);
  },

  downloadJuryFile(sessionId, certifications) {
    const certificationsForJury = _filterCertificationsEligibleForJury(certifications);
    const data = this.buildJuryFileData(certificationsForJury);
    const fileHeaders = _buildJuryFileHeaders();
    const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true, });
    const fileName = 'jury_session_' + sessionId + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
    this.fileSaver.saveAs(`${csv}\n`, fileName);
  },

  buildSessionExportFileData(session) {
    return session.certifications.map((certification) => {
      const rowItem = {
        'Numéro de certification': certification.id,
        'Prénom': this.csvService.sanitize(certification.firstName),
        'Nom': this.csvService.sanitize(certification.lastName),
        'Date de naissance': moment(certification.birthdate).format('DD/MM/YYYY'),
        'Lieu de naissance': this.csvService.sanitize(certification.birthplace),
        'Identifiant Externe': this.csvService.sanitize(certification.externalId),
        'Nombre de Pix': certification.pixScore,
        'Session': session.id,
        'Centre de certification': this.csvService.sanitize(session.certificationCenter)  ,
        'Date de passage de la certification': moment(certification.createdAt).format('DD/MM/YYYY'),
      };

      const certificationIndexedCompetences = certification.indexedCompetences;
      competenceIndexes.forEach((competence) => {
        if (!certificationIndexedCompetences[competence]) {
          rowItem[competence] = '-';
        } else if (certificationIndexedCompetences[competence].level === 0 || certificationIndexedCompetences[competence].level === -1) {
          rowItem[competence] = '0';
        } else {
          rowItem[competence] = certificationIndexedCompetences[competence].level;
        }
      });

      return rowItem;
    });
  },

  buildJuryFileData(certifications) {
    return certifications.map((certification) => {
      const rowItem = {
        'ID de session': certification.sessionId,
        'ID de certification': certification.id,
        'Statut de la certification': certification.status,
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

function _filterCertificationsEligibleForJury(certifications) {
  return certifications.filter((certification) => {
    return (certification.status !== 'validated') || (!_.isEmpty(certification.examinerComment)) || !certification.hasSeenEndTestScreen;
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
      'Signalement surveillant',
      'Commentaire pour le jury',
      'Ecran de fin non renseigné',
      'Note Pix'
    ],
    competenceIndexes
  );
}
