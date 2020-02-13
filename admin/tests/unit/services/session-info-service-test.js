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

  function buildCertification({ id, sessionId = 1, status = 'validated', hasSeenLastScreenFromPaperReport = true, examinerComment = null }) {
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
      hasSeenLastScreenFromPaperReport,
      examinerComment,
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
    
  });

});
