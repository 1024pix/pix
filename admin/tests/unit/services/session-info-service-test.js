import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';

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

  module('#downloadSessionExportFile', function() {

    const sessionId = 555;

    function buildCertification(id) {
      return EmberObject.create({
        id,
        sessionId,
        certificationId: id,
        assessmentId: 5,
        firstName: 'Toto',
        lastName: 'Le héros',
        birthdate: '20/03/1986',
        birthplace: 'une ville',
        externalId: '1234',
        creationDate: '20/07/2018 14:23:56',
        completionDate: '20/07/2018 14:23:56',
        resultsCreationDate: '20/07/2018 14:23:56',
        status: 'completed',
        juryId: '',
        commentForCandidate: 'candidate',
        commentForOrganization: 'organization',
        commentForJury: 'jury',
        pixScore: 100,
        indexedCompetences: {
          '1.1': { level: 1, score: 2 },
          '5.4': { level: 5, score: 4 },
          '4.3': { level: -1, score: 0 }
        }
      });
    }

    test('it generates well formatted result file', async function(assert) {
      // given
      const session = EmberObject.create({
        id: sessionId,
        certificationCenter: 'Certification center',
        certifications: A([
          buildCertification('1'),
          buildCertification('2'),
          buildCertification('3'),
          buildCertification('4'),
          buildCertification('5'),
        ])
      });

      // when
      await service.downloadSessionExportFile(session);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
        '"1";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"2";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"3";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"4";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"5";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '');
    });
  });

  module('#downloadJuryFile', function() {

    function buildCertification(id, status) {
      return EmberObject.create({
        id,
        sessionId: 5,
        certificationId: id,
        assessmentId: 5,
        firstName: 'Toto',
        lastName: 'Le héros',
        birthdate: '20/03/1986',
        birthplace: 'une ville',
        externalId: '1234',
        creationDate: '20/07/2018 14:23:56',
        completionDate: '20/07/2018 14:23:56',
        resultsCreationDate: '20/07/2018 14:23:56',
        status,
        juryId: '',
        commentForCandidate: 'candidate',
        commentForOrganization: 'organization',
        commentForJury: 'jury',
        pixScore: 100,
        indexedCompetences: {
          '1.1': { level: 1, score: 2 },
          '5.4': { level: 5, score: 4 },
          '4.3': { level: -1, score: 0 }
        }
      });
    }

    function buildCandidate(id, certificationId, comments = null, lastScreen = 'X') {
      return EmberObject.create({
        id,
        certificationId,
        firstName: 'Toto',
        lastName: 'Le héros',
        birthdate: '20/03/1986',
        birthplace: 'une ville',
        externalId: '1234',
        comments,
        lastScreen
      });
    }

    test('should include certification which status is not "validated"', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification('1', 'validated'),
          buildCertification('2', 'started'),
          buildCertification('3', 'rejected'),
          buildCertification('4', 'error'),
        ])
      });

      const validSessionCandidates = [
        buildCandidate(1, '1'),
        buildCandidate(2, '2'),
        buildCandidate(3, '3'),
        buildCandidate(4, '4'),
      ];

      // when
      service.downloadJuryFile(session, validSessionCandidates);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Commentaire surveillant";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"2";"started";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"3";"rejected";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"4";"error";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification which corresponding candidate has comments from manager', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification('1', 'validated'),
          buildCertification('2', 'validated'),
          buildCertification('3', 'validated'),
        ])
      });

      const candidateWithoutComments = buildCandidate(1, '1', null);
      const candidateWithEmptyComments = buildCandidate(1, '1', '   ');
      const candidateWithComments = buildCandidate(2, '2', 'manager comments');

      // when
      service.downloadJuryFile(session, [candidateWithoutComments, candidateWithEmptyComments, candidateWithComments]);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Commentaire surveillant";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"2";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"manager comments";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification which corresponding candidate did not seen the end screen', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification('1', 'validated'),
          buildCertification('2', 'validated'),
          buildCertification('3', 'validated'),
        ])
      });

      const candidateThatSawTheEndScreen = buildCandidate(1, '1', null, '  X  ');
      const candidateThatDidNotSeenTheEndScreen_null = buildCandidate(2, '2', null, null);
      const candidateThatDidNotSeenTheEndScreen_emptyString = buildCandidate(3, '3', null, '    ');

      // when
      service.downloadJuryFile(session, [candidateThatSawTheEndScreen, candidateThatDidNotSeenTheEndScreen_null, candidateThatDidNotSeenTheEndScreen_emptyString]);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Commentaire surveillant";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '5;"2";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '5;"3";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });
  });

});
