import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { ACQUIRED, REJECTED, NOT_TAKEN } from 'pix-admin/models/certification';

module('Unit | Model | certification', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function() {
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

  module('#wasRegisteredBeforeCPF', function() {

    [
      { value: '', label: 'Chaîne vide' },
      { value: null, label: 'NULL' },
      { value: undefined, label: 'undefined' },
    ].forEach(({ value, label }) => {

      test(`it should return true when sex value is ${label}`, function(assert) {
        // given
        const certification = run(() => store.createRecord('certification', {
          sex: value,
        }));

        // then
        assert.true(certification.wasRegisteredBeforeCPF);
      });
    });

    test('should return false when sex is defined', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        sex: 'M',
      }));

      // then
      assert.false(certification.wasRegisteredBeforeCPF);
    });
  });

  module('#get completionDate', function() {

    test('it should return null if completedAt is null', function(assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('certification', { completedAt: null });
      });

      // then
      assert.equal(juryCertificationSummary.completionDate, null);
    });

    test('it should a formatted date when completedAt is defined', function(assert) {
      // given
      const juryCertificationSummary = run(() => {
        return store.createRecord('certification', { completedAt: '2021-06-30 15:10:45' });
      });

      // then
      assert.equal(juryCertificationSummary.completionDate, '30/06/2021, 15:10:45');
    });
  });

  module('#getInformation', function() {

    test('it should return the certification candidate information', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      }));

      // when
      const information = certification.getInformation();

      // then
      assert.deepEqual(information, {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });
    });
  });

  module('#updateInformation', function() {

    test('it should update the certification candidate information', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      }));

      // when
      certification.updateInformation({
        firstName: 'Xander',
        lastName: 'Harris',
        birthdate: '1981-02-22',
        birthplace: 'Argelès',
        sex: 'M',
        birthInseeCode: '99120',
        birthPostalCode: null,
        birthCountry: 'TheMoon !',
      });

      // then
      assert.deepEqual(certification.getInformation(), {
        firstName: 'Xander',
        lastName: 'Harris',
        birthdate: '1981-02-22',
        birthplace: 'Argelès',
        sex: 'M',
        birthInseeCode: '99120',
        birthPostalCode: null,
        birthCountry: 'TheMoon !',
      });
    });
  });

  module('#wasBornInFrance', function() {

    test('it should return true when candidate was born in France', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', { birthCountry: 'FRANCE' }));

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.true(wasBornInFrance);
    });

    test('it should return false when candidate was not born in France', function(assert) {
      // given
      const certification = run(() => store.createRecord('certification', { birthCountry: 'OTHER_COUNTRY' }));

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.false(wasBornInFrance);
    });
  });
});
