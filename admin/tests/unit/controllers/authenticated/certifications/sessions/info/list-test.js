import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';

module('Unit | Controller | authenticated/certifications/sessions/info/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    assert.ok(controller);
  });

  test('it generates well formatted result file', function(assert) {
    // given
    const fileSaverStub = Service.extend({
      content:'',
      saveAs(content) {
        this.set('content', content);
      },
      getContent() {
        return this.get('content');
      }
    });
    this.owner.register('service:file-saver', fileSaverStub);
    const controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    controller.set('model', {
      session:EmberObject.create({
      }),
      certifications:EmberObject.create({
      }),
      certificationIds:A([1,2,3,4,5])
    });
    this.set('counter', 0);
    const that = this;
    controller.set('store', {
      findRecord(type, id) {
        that.set('counter', that.get('counter') + 1);
        return Promise.resolve(EmberObject.create({
          id:id,
          sessionId: 5,
          certificationId: id,
          assessmentId: 5,
          firstName: 'Toto',
          lastName: 'Le héros',
          birthdate: '20/03/1986',
          birthplace: 'une ville',
          externalId: '1234',
          creationDate: '20/07/2018 14:23:56',
          completionDate:'20/07/2018 14:23:56',
          resultsCreationDate:'20/07/2018 14:23:56',
          status: 'completed',
          juryId: '',
          commentForCandidate: 'candidate',
          commentForOrganization: 'organization',
          commentForJury: 'jury',
          pixScore: 100,
          indexedCompetences:{
            '1.1':{ level:1, score:2 },
            '5.4':{ level:5, score:4 },
            '4.3':{ level:-1, score:0 }
          }
        }));
      }
    });
    assert.expect(2);

    // when
    controller.send('onExportResults');

    // then
    return settled()
      .then(() => {
        assert.equal(this.get('counter'),5);
        const service = this.owner.lookup('service:file-saver');
        assert.equal(service.getContent(), '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n1;"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";5;;"20/07/2018"\n2;"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";5;;"20/07/2018"\n3;"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";5;;"20/07/2018"\n4;"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";5;;"20/07/2018"\n5;"Toto";"Le héros";"20/03/1986";"une ville";"1234";100;1;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";5;;"20/07/2018"\n');
      });

  });

  test('it generates well formatted jury file', function(assert) {
    // given
    const fileSaverStub = Service.extend({
      content:'',
      saveAs(content) {
        this.set('content', content);
      },
      getContent() {
        return this.get('content');
      }
    });
    this.owner.register('service:file-saver', fileSaverStub);
    const controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    controller.set('model', {
      session:EmberObject.create({
      }),
      certifications:EmberObject.create({
      }),
      certificationIds:A([1,2,3,4,5])
    });
    this.set('counter', 0);
    const that = this;
    controller.set('store', {
      findRecord(type, id) {
        that.set('counter', that.get('counter') + 1);
        const status = (id == 2) ? 'error' : 'validated';
        return Promise.resolve(EmberObject.create({
          id:id,
          sessionId: 5,
          certificationId: id,
          assessmentId: 5,
          firstName: 'Toto',
          lastName: 'Le héros',
          birthdate: '20/03/1986',
          birthplace: 'une ville',
          externalId: '1234',
          creationDate: '20/07/2018 14:23:56',
          completionDate:'20/07/2018 14:23:56',
          resultsCreationDate:'20/07/2018 14:23:56',
          status: status,
          juryId: '',
          commentForCandidate: 'candidate',
          commentForOrganization: 'organization',
          commentForJury: 'jury',
          pixScore: 100,
          indexedCompetences:{
            '1.1':{ level:1, score:2 },
            '5.4':{ level:5, score:4 },
            '4.3':{ level:-1, score:0 }
          }
        }));
      }
    });
    assert.expect(2);
    const certificationWithComment = {
      id:5,
      certificationId: 5,
      firstName: 'Toto',
      lastName: 'Le héros',
      birthdate: '20/03/1986',
      birthplace: 'une ville',
      externalId: '1234',
      comments:'manager comments'
    };

    // when
    controller.send('onGetJuryFile', [certificationWithComment]);

    // then
    return settled()
      .then(() => {
        assert.equal(this.get('counter'),5);
        const service = this.owner.lookup('service:file-saver');
        assert.equal(service.getContent(), '"ID de session";"ID de certification";"Statut de la certification";"Date de debut";"Date de fin";"Commentaire surveillant";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n5;2;"error";"20/07/2018 14:23:56";"20/07/2018 14:23:56";;"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n5;5;"validated";"20/07/2018 14:23:56";"20/07/2018 14:23:56";"manager comments";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";-1;"";""\n');
      });

  });

});
