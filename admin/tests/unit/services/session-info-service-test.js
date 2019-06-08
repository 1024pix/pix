import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { run } from '@ember/runloop';
import sinon from 'sinon';

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

  function buildCertification({ id, sessionId = 1, status = 'validated' }) {
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

  module('#updateCertificationsStatus', function() {

    test('should update the status to "true" for the given certifications when "isPublished" parameter is "true"', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      /*
       * Prendre la main sur le prototype pour stubber la méthode "save" n'est clairement pas la façon la plus propre de faire.
       * Une meilleure façon de faire serait de passer par Ember CLI Mirage qui, depuis la version 1.0, incite à l'utiliser même dans les TU/TI (vs. TA only).
       * Cependant, tels que sont fait l'API (/certifications et /certification-courses) ainsi que l'adapter Certification, à moins de faire un maxi dev côté mirage, ça ne matche pas.
       */
      const Certification = store.modelFor('certification');
      Certification.prototype.save = sinon.stub();

      const certification_1 = run(() => store.createRecord('certification', { isPublished: false }));
      const certification_2 = run(() => store.createRecord('certification', { isPublished: true }));
      const certification_3 = run(() => store.createRecord('certification', { isPublished: false }));

      const certifications = [certification_1, certification_2, certification_3];

      // when
      await service.updateCertificationsStatus(certifications, true);

      // then
      certifications.forEach((certification) => assert.equal(certification.isPublished, true));
      sinon.assert.callCount(Certification.prototype.save, 3);
      sinon.assert.alwaysCalledWith(Certification.prototype.save, { adapterOptions: { updateMarks: false } });
    });

    test('should update the status to "false" for the given certifications when "isPublished" parameter is "false"', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const Certification = store.modelFor('certification');
      Certification.prototype.save = sinon.stub();

      const certification_1 = run(() => store.createRecord('certification', { isPublished: false }));
      const certification_2 = run(() => store.createRecord('certification', { isPublished: true }));
      const certification_3 = run(() => store.createRecord('certification', { isPublished: false }));

      const certifications = [certification_1, certification_2, certification_3];

      // when
      await service.updateCertificationsStatus(certifications, false);

      // then
      certifications.forEach((certification) => assert.equal(certification.isPublished, false));
      sinon.assert.callCount(Certification.prototype.save, 3);
      sinon.assert.alwaysCalledWith(Certification.prototype.save, { adapterOptions: { updateMarks: false } });
    });

  });

  module('#downloadSessionExportFile', function() {

    const sessionId = 555;

    test('it generates well formatted result file', async function(assert) {
      // given
      const session = EmberObject.create({
        id: sessionId,
        certificationCenter: 'Certification center',
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
        '"1";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"2";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"3";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"4";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '"5";"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";555;"Certification center";"20/07/2018"\n' +
        '');
    });
  });

  module('#downloadJuryFile', function() {

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
          buildCertification({ id: '1', status: 'validated' }),
          buildCertification({ id: '2', status: 'started' }),
          buildCertification({ id: '3', status: 'rejected' }),
          buildCertification({ id: '4', status: 'error' }),
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
        '1;"2";"started";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '1;"3";"rejected";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '1;"4";"error";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certification which corresponding candidate has comments from manager', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification({ id: '1', status: 'validated' }),
          buildCertification({ id: '2', status: 'validated' }),
          buildCertification({ id: '3', status: 'validated' }),
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
        '1;"2";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"manager comments";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });

    test('should include certifications from candidates whom have not seen the end screen', async function(assert) {
      const session = EmberObject.create({
        id: 5,
        certifications: A([
          buildCertification({ id: '1', status: 'validated' }),
          buildCertification({ id: '2', status: 'validated' }),
          buildCertification({ id: '3', status: 'validated' }),
        ])
      });

      const candidateThatSawTheEndScreen = buildCandidate(1, '1', null, '  X  ');
      const candidateThatDidNotSeeTheEndScreen_null = buildCandidate(2, '2', null, null);
      const candidateThatDidNotSeeTheEndScreen_emptyString = buildCandidate(3, '3', null, '    ');

      // when
      service.downloadJuryFile(session, [candidateThatSawTheEndScreen, candidateThatDidNotSeeTheEndScreen_null, candidateThatDidNotSeeTheEndScreen_emptyString]);

      // then
      assert.equal(fileSaverStub.getContent(), '\uFEFF' +
        '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Commentaire surveillant";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n' +
        '1;"2";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '1;"3";"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n' +
        '');
    });
  });

});
