import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { ACQUIRED, REJECTED, NOT_TAKEN } from 'pix-admin/models/certification';

module('Unit | Model | certification', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#cleaCertificationStatusLabel', function() {

    const cleaStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    cleaStatusesAndExpectedLabel.forEach((expectedLabel, cleaStatus) => {
      module(`when cleaCertificationStatus is ${cleaStatus}`, function() {

        test(`cleaCertificationStatusLabel should be ${expectedLabel}`, function(assert) {
          // given
          const certification = run(() => store.createRecord('certification', {
            cleaCertificationStatus: cleaStatus,
          }));

          // when
          const label = certification.cleaCertificationStatusLabel;

          // then
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusDroitMaitreCertificationStatusLabel', function() {

    const pixPlusDroitMaitreStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusDroitMaitreStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusDroitMaitreCertificationStatus) => {
      module(`when pixPlusDroitMaitreCertificationStatus is ${pixPlusDroitMaitreCertificationStatus}`, function() {

        test(`pixPlusDroitMaitreCertificationStatusLabel should be ${expectedLabel}`, function(assert) {
          // given
          const certification = run(() => store.createRecord('certification', {
            pixPlusDroitMaitreCertificationStatus: pixPlusDroitMaitreCertificationStatus,
          }));

          // when
          const label = certification.pixPlusDroitMaitreCertificationStatusLabel;

          // then
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusDroitExpertCertificationStatusLabel', function() {

    const pixPlusDroitExpertStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusDroitExpertStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusDroitExpertCertificationStatus) => {
      module(`when pixPlusDroitExpertCertificationStatus is ${pixPlusDroitExpertCertificationStatus}`, function() {

        test(`pixPlusDroitMaitreCertificationStatusLabel should be ${expectedLabel}`, function(assert) {
          // given
          const certification = run(() => store.createRecord('certification', {
            pixPlusDroitExpertCertificationStatus: pixPlusDroitExpertCertificationStatus,
          }));

          // when
          const label = certification.pixPlusDroitExpertCertificationStatusLabel;

          // then
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#publishedText', function() {

    test('it should return "oui" when isPublished is true', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        isPublished: true,
      }));

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      assert.equal(isPublishedLabel, 'Oui');
    });

    test('it should return "non" when isPublished is false', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        isPublished: false,
      }));

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      assert.equal(isPublishedLabel, 'Non');
    });
  });

  module('#indexedCompetences', function() {

    test('it should return the indexedCompetences from the competencesWithMark', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        competencesWithMark: [{
          id: 1,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'rec11',
          level: 4,
          score: 39,
          assessmentResultId: 123,
        }, {
          id: 2,
          area_code: '2',
          competence_code: '2.1',
          competenceId: 'rec21',
          level: 5,
          score: 20,
          assessmentResultId: 123,
        }],
      }));

      // when
      const indexedCompetences = certification.indexedCompetences;

      // then
      assert.deepEqual(indexedCompetences, {
        '1.1': {
          index: '1.1',
          level: 4,
          score: 39,
        },
        '2.1': {
          index: '2.1',
          level: 5,
          score: 20,
        },
      });
    });
  });

  module('#competences', function() {

    test('it should return the competences from the indexedCompetences', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        competencesWithMark: [{
          id: 1,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'rec11',
          level: 4,
          score: 39,
          assessmentResultId: 123,
        }, {
          id: 2,
          area_code: '2',
          competence_code: '2.1',
          competenceId: 'rec21',
          level: 5,
          score: 20,
          assessmentResultId: 123,
        }],
      }));

      // when
      const competences = certification.competences;

      // then
      assert.deepEqual(competences, [
        {
          index: '1.1',
          level: 4,
          score: 39,
        },
        {
          index: '2.1',
          level: 5,
          score: 20,
        },
      ]);
    });
  });

  module('#statusLabelAndValue', function() {

    [
      { value: 'started', label: 'Démarrée' },
      { value: 'error', label: 'En erreur' },
      { value: 'validated', label: 'Validée' },
      { value: 'rejected', label: 'Rejetée' },
      { value: 'cancelled', label: 'Annulée' },
    ].forEach((certificationStatus) => {

      test('it should return the right pair of label and value', function(assert) {
        // given
        const certification = run(() => store.createRecord('certification', {
          status: certificationStatus.value,
        }));

        // then
        assert.deepEqual(certification.statusLabelAndValue, {
          value: certificationStatus.value,
          label: certificationStatus.label,
        });
      });
    });
  });
});
