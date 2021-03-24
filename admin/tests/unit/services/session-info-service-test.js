import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import moment from 'moment';

module('Unit | Service | session-info-service', (hooks) => {

  setupTest(hooks);

  class FileSaverStub extends Service {
    content = '';
    saveAs(content) {
      this.content = content;
    }
    getContent() {
      return this.content;
    }
  }

  let fileSaverStub;
  let service;

  hooks.beforeEach(function() {
    this.owner.register('service:file-saver', FileSaverStub);

    fileSaverStub = this.owner.lookup('service:file-saver');
    service = this.owner.lookup('service:session-info-service');
  });

  function buildCertification({
    id,
    sessionId = 1,
    status = 'validated',
    hasSeenEndTestScreen = true,
    displayCleaCertificationStatus = 'Non passée',
    examinerComment = null,
    indexedCompetences = {
      '1.1': { level: 1, score: 2 },
      '5.4': { level: 5, score: 4 },
      '4.3': { level: -1, score: 0 },
    },
  }) {
    return EmberObject.create({
      id,
      sessionId,
      assessmentId: 5,
      firstName: 'Toto',
      lastName: 'Le héros',
      birthdate: '1986-03-20',
      birthplace: 'une ville',
      externalId: '1234',
      createdAt: new Date('2018-07-20T14:23:56Z'),
      creationDate: '20/07/2018 14:23:56',
      completionDate: '20/07/2018 14:23:56',
      resultsCreationDate: '20/07/2018 14:23:56',
      status,
      juryId: '',
      hasSeenEndTestScreen,
      examinerComment,
      displayCleaCertificationStatus,
      commentForCandidate: 'candidate',
      commentForOrganization: 'organization',
      commentForJury: 'jury',
      pixScore: 100,
      indexedCompetences,
    });
  }

  module('#downloadJuryFile', () => {

    test('should include certification which status is not "validated"', async function(assert) {
      const session = EmberObject.create({ id: 5 });
      const certifications = A([
        buildCertification({ id: '1', status: 'validated', sessionId: 5, displayCleaCertificationStatus: 'Validée' }),
        buildCertification({ id: '2', status: 'started', sessionId: 5, displayCleaCertificationStatus: 'Validée' }),
        buildCertification({ id: '3', status: 'rejected', sessionId: 5, displayCleaCertificationStatus: 'Non passée' }),
        buildCertification({ id: '4', status: 'error', sessionId: 5, displayCleaCertificationStatus: 'Rejetée' }),
      ]);

      // when
      service.downloadJuryFile({ sessionId: session.id, certifications: certifications });

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Certification CléA numérique";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"2";"started";"Validée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"3";"rejected";"Non passée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"4";"error";"Rejetée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification with comment from examiner', async function(assert) {
      const session = EmberObject.create({ id: 5 });
      const certifications = A([
        buildCertification({ id: '1', status: 'validated', sessionId: 5, examinerComment: 'examiner comment', displayCleaCertificationStatus: 'Validée' }),
        buildCertification({ id: '2', status: 'validated', sessionId: 5 }),
        buildCertification({ id: '3', status: 'validated', sessionId: 5 }),
      ]);

      // when
      service.downloadJuryFile({ sessionId: session.id, certifications: certifications });

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Certification CléA numérique";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"1";"validated";"Validée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"examiner comment";"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification with not checked end screen from examiner', async function(assert) {
      const session = EmberObject.create({ id: 5 });
      const certifications = A([
        buildCertification({ id: '1', status: 'validated', sessionId: 5, hasSeenEndTestScreen: false, displayCleaCertificationStatus: 'Validée' }),
        buildCertification({ id: '2', status: 'validated', sessionId: 5 }),
        buildCertification({ id: '3', status: 'validated', sessionId: 5 }),
      ]);

      // when
      service.downloadJuryFile({ sessionId: session.id, certifications: certifications });

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Certification CléA numérique";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"1";"validated";"Validée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"non renseigné";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    module('when data start with illegal characters', () => {

      test('should sanitize Jury data', async function(assert) {
        // given
        const certification = buildCertification({ id: '1', status: 'validated', sessionId: 5, examinerComment: '@examiner comment', displayCleaCertificationStatus: 'Non passée' });
        certification.set('commentForJury', '-jury');

        const session = EmberObject.create({ id: 5 });
        const certifications = A([certification]);

        // when
        service.downloadJuryFile({ sessionId: session.id, certifications: certifications });

        // then
        assert.equal(fileSaverStub.getContent(), '\uFEFF' +
          '"ID de session";"ID de certification";"Statut de la certification";"Certification CléA numérique";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
          '5;"1";"validated";"Non passée";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"\'@examiner comment";"\'-jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
          '');
      });
    });
  });

  module('#buildSessionExportFileData', () => {

    module('when the certif status is rejected', () => {
      let certifRejected;
      let sessionWithRejectedCertif;
      let certifications;

      hooks.beforeEach(() => {
        const indexedCompetences = { '1.1': { level: 3, score: 2 } };
        certifRejected = buildCertification({ sessionId: 1, status: 'rejected', indexedCompetences });
        sessionWithRejectedCertif = { certificationCenterName: 'Salut' };
        certifications = [certifRejected];
      });

      test('should show "-" or "0" for competences', async function(assert) {
        // when
        const result = service.buildSessionExportFileData({ session: sessionWithRejectedCertif, certifications });

        // then
        const expectedResult = [{
          'Numéro de certification': certifRejected.id,
          'Prénom': certifRejected.firstName,
          'Nom': certifRejected.lastName,
          'Date de naissance': moment(certifRejected.birthdate).format('DD/MM/YYYY'),
          'Lieu de naissance': certifRejected.birthplace,
          'Identifiant Externe': certifRejected.externalId,
          'Nombre de Pix': '0',
          'Session': sessionWithRejectedCertif.id,
          'Centre de certification': sessionWithRejectedCertif.certificationCenterName,
          'Date de passage de la certification': moment(certifRejected.createdAt).format('DD/MM/YYYY'),
          '1.1': '0', '1.2': '-', '1.3': '-',
          '2.1': '-', '2.2': '-', '2.3': '-', '2.4': '-',
          '3.1': '-', '3.2': '-', '3.3': '-', '3.4': '-',
          '4.1': '-', '4.2': '-', '4.3': '-',
          '5.1': '-', '5.2': '-',
        }];
        assert.deepEqual(result, expectedResult);
      });

    });

    module('when the certif status is validated', () => {

      let certifValidated;
      let sessionWithValidatedCertif;
      let certifications;

      hooks.beforeEach(() => {
        const indexedCompetences = { '1.1': { level: 3, score: 2 } };
        certifValidated = buildCertification({ sessionId: 1, indexedCompetences });
        sessionWithValidatedCertif = { certificationCenterName: 'Salut' };
        certifications = [certifValidated];
      });

      test('should show "-" or correct value for competences', function(assert) {
        // when
        const result = service.buildSessionExportFileData({ session: sessionWithValidatedCertif, certifications });

        // then
        const expectedResult = [{
          'Numéro de certification': certifValidated.id,
          'Prénom': certifValidated.firstName,
          'Nom': certifValidated.lastName,
          'Date de naissance': moment(certifValidated.birthdate).format('DD/MM/YYYY'),
          'Lieu de naissance': certifValidated.birthplace,
          'Identifiant Externe': certifValidated.externalId,
          'Nombre de Pix': certifValidated.pixScore,
          'Session': sessionWithValidatedCertif.id,
          'Centre de certification': sessionWithValidatedCertif.certificationCenterName,
          'Date de passage de la certification': moment(certifValidated.createdAt).format('DD/MM/YYYY'),
          '1.1': 3, '1.2': '-', '1.3': '-',
          '2.1': '-', '2.2': '-', '2.3': '-', '2.4': '-',
          '3.1': '-', '3.2': '-', '3.3': '-', '3.4': '-',
          '4.1': '-', '4.2': '-', '4.3': '-',
          '5.1': '-', '5.2': '-',
        }];
        assert.deepEqual(result, expectedResult);
      });
    });
  });

});
