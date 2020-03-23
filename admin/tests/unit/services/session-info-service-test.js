import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import moment from 'moment';

module('Unit | Service | session-info-service', function(hooks) {

  setupTest(hooks);

  let fileSaverStub;
  let service;

  hooks.beforeEach(function() {
    const FileSaverStub = Service.extend({
      content: '',
      saveAs(content) {
        this.set('content', content);
      },
      getContent() {
        return this.content;
      }
    });
    this.owner.register('service:file-saver', FileSaverStub);
    fileSaverStub = this.owner.lookup('service:file-saver');

    service = this.owner.lookup('service:session-info-service');
  });

  function buildCertification({
    id,
    sessionId = 1,
    status = 'validated',
    hasSeenEndTestScreen = true,
    examinerComment = null,
    indexedCompetences = {
      '1.1': { level: 1, score: 2 },
      '5.4': { level: 5, score: 4 },
      '4.3': { level: -1, score: 0 }
    }
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
      commentForCandidate: 'candidate',
      commentForOrganization: 'organization',
      commentForJury: 'jury',
      pixScore: 100,
      indexedCompetences,
    });
  }

  module('#downloadSessionExportFile', function() {

    const sessionId = 555;

    test('it generates well formatted result file', async function(assert) {
      // given
      const session = EmberObject.create({
        id: sessionId,
        certificationCenterName: 'Certification center',
        certifications: A([
          buildCertification({ id: '1', sessionId }),
          buildCertification({ id: '2', sessionId }),
          buildCertification({ id: '3', sessionId }),
          buildCertification({ id: '4', sessionId }),
          buildCertification({ id: '5', sessionId }),
        ])
      });

      // when
      await service.downloadSessionExportFile(session);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
        '"1";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"2";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"3";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"4";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"5";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '');
    });

    module('when data start with illegal characters', function() {

      test('should sanitize session data', async function(assert) {
        // given
        const certification = buildCertification({ id: '1', sessionId });
        certification.set('firstName', '-Toto');
        certification.set('lastName', '+Le héros');
        certification.set('birthplace', '=une ville');
        certification.set('externalId', '@1234');

        const session = EmberObject.create({
          id: sessionId,
          certificationCenterName: '@Certification center',
          certifications: A([ certification ])
        });

        // when
        await service.downloadSessionExportFile(session);

        // then
        assert.equal(fileSaverStub.getContent(), '\uFEFF' +
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
          '"1";"\'-Toto";"\'+Le héros";"20/03/1986";"\'=une ville";"\'@1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"0";"-";"-";555;"\'@Certification center";"20/07/2018"\n' +
          '');
      });
    });
  });

  module('#downloadJuryFile', function() {

    test('should include certification which status is not "validated"', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification({ id: '1', status: 'validated', sessionId: 5 }),
          buildCertification({ id: '2', status: 'started', sessionId: 5 }),
          buildCertification({ id: '3', status: 'rejected', sessionId: 5 }),
          buildCertification({ id: '4', status: 'error', sessionId: 5 }),
        ])
      });

      // when
      service.downloadJuryFile(session.id, session.certifications);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"2";"started";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"3";"rejected";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"4";"error";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification with comment from examiner', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification({ id: '1', status: 'validated', sessionId: 5, examinerComment: 'examiner comment' }),
          buildCertification({ id: '2', status: 'validated', sessionId: 5, }),
          buildCertification({ id: '3', status: 'validated', sessionId: 5, }),
        ])
      });

      // when
      service.downloadJuryFile(session.id, session.certifications);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"1";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"examiner comment";"jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification with not checked end screen from examiner', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification({ id: '1', status: 'validated', sessionId: 5, hasSeenEndTestScreen: false }),
          buildCertification({ id: '2', status: 'validated', sessionId: 5 }),
          buildCertification({ id: '3', status: 'validated', sessionId: 5 }),
        ])
      });

      // when
      service.downloadJuryFile(session.id, session.certifications);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"1";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";"non renseigné";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    module('when data start with illegal characters', function() {

      test('should sanitize Jury data', async function(assert) {
        // given
        const certification = buildCertification({ id: '1', status: 'validated', sessionId: 5, examinerComment: '@examiner comment' });
        certification.set('commentForJury', '-jury');

        const session = EmberObject.create({
          id: 5,
          certifications: A([ certification ])
        });

        // when
        service.downloadJuryFile(session.id, session.certifications);

        // then
        assert.equal(fileSaverStub.getContent(), '\uFEFF' +
          '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Signalement surveillant";"Commentaire pour le jury";"Ecran de fin non renseigné";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
          '5;"1";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"\'@examiner comment";"\'-jury";"";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
          '');
      });
    });
  });

  module('#buildSessionExportFileData', function() {

    module('when the certif status is rejected', function() {
      let certifRejected;
      let sessionWithRejectedCertif;

      hooks.beforeEach(function() {
        const indexedCompetences = { '1.1': { level: 3, score: 2 } } ;
        certifRejected = buildCertification({ sessionId: 1, status: 'rejected', indexedCompetences });
        sessionWithRejectedCertif = { certificationCenterName: 'Salut', certifications: [ certifRejected ] };
      });

      test('should show "-" or "0" for competences', async function(assert) {
        // when
        const result =  service.buildSessionExportFileData(sessionWithRejectedCertif);

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

    module('when the certif status is validated', function() {

      let certifValidated;
      let sessionWithValidatedCertif;

      hooks.beforeEach(function() {
        const indexedCompetences = { '1.1': { level: 3, score: 2 } } ;
        certifValidated = buildCertification({ sessionId: 1, indexedCompetences });
        sessionWithValidatedCertif = { certificationCenterName: 'Salut', certifications: [ certifValidated ] };
      });

      test('should show "-" or correct value for competences', function(assert) {
        // when
        const result =  service.buildSessionExportFileData(sessionWithValidatedCertif);

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
