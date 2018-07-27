import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import wait from 'ember-test-helpers/wait';

module('Unit | Controller | authenticated/certifications/sessions/info/list', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    assert.ok(controller);
  });

  test('it calls FileSaver with well formated csv', function(assert) {
    // given
    let fileSaverStub = Service.extend({
      content:'',
      saveAs(content) {
        this.set('content', content);
      },
      getContent() {
        return this.get('content');
      }
    });
    this.owner.register('service:file-saver', fileSaverStub);
    let controller = this.owner.lookup('controller:authenticated/certifications/sessions/info/list');
    controller.set('model', {
      session:EmberObject.create( {
      }),
      certifications:EmberObject.create({
      }),
      certificationIds:A([1,2,3])
    });
    this.set('counter', 0);
    let that = this;
    controller.set('store', {
      findRecord(type, id) {
        that.set('counter', that.get('counter')+1);
        return Promise.resolve(EmberObject.create( {
          id:id,
          sessionId: 5,
          certificationId: id,
          assessmentId: 5,
          firstName: 'Toto',
          lastName: 'Le héros',
          birthdate: '20/03/1986',
          birthplace: 'une ville',
          externalId: '1234',
          creationDate: '20/07/2018',
          completionDate:'20/07/2018',
          resultsCreationDate:'20/07/2018',
          status: 'completed',
          juryId: '',
          commentForCandidate: 'candidate',
          commentForOrganization: 'organization',
          commentForJury: 'jury',
          pixScore: 100,
          indexedCompetences:{
            '1.1':{level:1, score:2},
            '5.4':{level:5, score:4}
          }
        }));
      }
    });
    assert.expect(2);

    // when
    controller.send('onExport');

    // then
    return wait()
    .then(() => {
      assert.equal(this.get('counter'),3);
      let service = this.owner.lookup('service:file-saver');
      assert.equal(service.getContent(), '"ID de certification";"Prenom du candidat";"Nom du candidat";"Date de naissance du candidat";"Lieu de naissance du candidat";"Identifiant Externe";"Statut de la certification";"ID de session";"Date de debut";"Date de fin";"Commentaire pour le candidat";"Commentaire pour l\'organisation";"Commentaire pour le jury";"Note Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2"\n1;"Toto";"Le héros";"20/03/1986";"une ville";"1234";"completed";5;"20/07/2018";"20/07/2018";"candidate";"organization";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";"";"";""\n2;"Toto";"Le héros";"20/03/1986";"une ville";"1234";"completed";5;"20/07/2018";"20/07/2018";"candidate";"organization";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";"";"";""\n3;"Toto";"Le héros";"20/03/1986";"une ville";"1234";"completed";5;"20/07/2018";"20/07/2018";"candidate";"organization";"jury";100;1;"";"";"";"";"";"";"";"";"";"";"";"";"";"";""');
    });
  });
});
