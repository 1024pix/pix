import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ACQUIRED, REJECTED, NOT_TAKEN } from 'pix-admin/models/certification';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#cleaCertificationStatusLabel', function () {
    const cleaStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    cleaStatusesAndExpectedLabel.forEach((expectedLabel, cleaStatus) => {
      module(`when cleaCertificationStatus is ${cleaStatus}`, function () {
        test(`cleaCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            cleaCertificationStatus: cleaStatus,
          });

          // when
          const label = certification.cleaCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusDroitMaitreCertificationStatusLabel', function () {
    const pixPlusDroitMaitreStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusDroitMaitreStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusDroitMaitreCertificationStatus) => {
      module(`when pixPlusDroitMaitreCertificationStatus is ${pixPlusDroitMaitreCertificationStatus}`, function () {
        test(`pixPlusDroitMaitreCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            pixPlusDroitMaitreCertificationStatus: pixPlusDroitMaitreCertificationStatus,
          });

          // when
          const label = certification.pixPlusDroitMaitreCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusDroitExpertCertificationStatusLabel', function () {
    const pixPlusDroitExpertStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusDroitExpertStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusDroitExpertCertificationStatus) => {
      module(`when pixPlusDroitExpertCertificationStatus is ${pixPlusDroitExpertCertificationStatus}`, function () {
        test(`pixPlusDroitMaitreCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            pixPlusDroitExpertCertificationStatus: pixPlusDroitExpertCertificationStatus,
          });

          // when
          const label = certification.pixPlusDroitExpertCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusEduInitieCertificationStatusLabel', function () {
    const pixPlusEduInitieStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusEduInitieStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusEduInitieCertificationStatus) => {
      module(`when pixPlusEduInitieCertificationStatusLabel is ${pixPlusEduInitieCertificationStatus}`, function () {
        test(`pixPlusEduInitieCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            pixPlusEduInitieCertificationStatus,
          });

          // when
          const label = certification.pixPlusEduInitieCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusEduConfirmeCertificationStatusLabel', function () {
    const pixPlusEduConfirmeStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusEduConfirmeStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusEduConfirmeCertificationStatus) => {
      module(
        `when pixPlusEduConfirmeCertificationStatusLabel is ${pixPlusEduConfirmeCertificationStatus}`,
        function () {
          test(`pixPlusEduConfirmeCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
            // given
            const certification = store.createRecord('certification', {
              pixPlusEduConfirmeCertificationStatus,
            });

            // when
            const label = certification.pixPlusEduConfirmeCertificationStatusLabel;

            // then
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line qunit/no-assert-equal
            assert.equal(label, expectedLabel);
          });
        }
      );
    });
  });

  module('#pixPlusEduAvanceCertificationStatusLabel', function () {
    const pixPlusEduAvanceStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusEduAvanceStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusEduAvanceCertificationStatus) => {
      module(`when pixPlusEduAvanceCertificationStatusLabel is ${pixPlusEduAvanceCertificationStatus}`, function () {
        test(`pixPlusEduAvanceCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            pixPlusEduAvanceCertificationStatus,
          });

          // when
          const label = certification.pixPlusEduAvanceCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#pixPlusEduExpertCertificationStatusLabel', function () {
    const pixPlusEduExpertStatusesAndExpectedLabel = new Map([
      [ACQUIRED, 'Validée'],
      [REJECTED, 'Rejetée'],
      [NOT_TAKEN, 'Non passée'],
    ]);
    pixPlusEduExpertStatusesAndExpectedLabel.forEach((expectedLabel, pixPlusEduExpertCertificationStatus) => {
      module(`when pixPlusEduExpertCertificationStatusLabel is ${pixPlusEduExpertCertificationStatus}`, function () {
        test(`pixPlusEduExpertCertificationStatusLabel should be ${expectedLabel}`, function (assert) {
          // given
          const certification = store.createRecord('certification', {
            pixPlusEduExpertCertificationStatus,
          });

          // when
          const label = certification.pixPlusEduExpertCertificationStatusLabel;

          // then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(label, expectedLabel);
        });
      });
    });
  });

  module('#publishedText', function () {
    test('it should return "oui" when isPublished is true', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        isPublished: true,
      });

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(isPublishedLabel, 'Oui');
    });

    test('it should return "non" when isPublished is false', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        isPublished: false,
      });

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(isPublishedLabel, 'Non');
    });
  });

  module('#indexedCompetences', function () {
    test('it should return the indexedCompetences from the competencesWithMark', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [
          {
            id: 1,
            area_code: '1',
            competence_code: '1.1',
            competenceId: 'rec11',
            level: 4,
            score: 39,
            assessmentResultId: 123,
          },
          {
            id: 2,
            area_code: '2',
            competence_code: '2.1',
            competenceId: 'rec21',
            level: 5,
            score: 20,
            assessmentResultId: 123,
          },
        ],
      });

      // when
      const indexedCompetences = certification.indexedCompetences;

      // then
      assert.deepEqual(indexedCompetences, {
        1.1: {
          index: '1.1',
          level: 4,
          score: 39,
        },
        2.1: {
          index: '2.1',
          level: 5,
          score: 20,
        },
      });
    });
  });

  module('#competences', function () {
    test('it should return the competences from the indexedCompetences', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [
          {
            id: 1,
            area_code: '1',
            competence_code: '1.1',
            competenceId: 'rec11',
            level: 4,
            score: 39,
            assessmentResultId: 123,
          },
          {
            id: 2,
            area_code: '2',
            competence_code: '2.1',
            competenceId: 'rec21',
            level: 5,
            score: 20,
            assessmentResultId: 123,
          },
        ],
      });

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

  module('#statusLabelAndValue', function () {
    [
      { value: 'started', label: 'Démarrée' },
      { value: 'error', label: 'En erreur' },
      { value: 'validated', label: 'Validée' },
      { value: 'rejected', label: 'Rejetée' },
      { value: 'cancelled', label: 'Annulée' },
    ].forEach((certificationStatus) => {
      test('it should return the right pair of label and value', function (assert) {
        // given
        const certification = store.createRecord('certification', {
          status: certificationStatus.value,
        });

        // then
        assert.deepEqual(certification.statusLabelAndValue, {
          value: certificationStatus.value,
          label: certificationStatus.label,
        });
      });
    });
  });

  module('#wasRegisteredBeforeCPF', function () {
    [
      { value: '', label: 'Chaîne vide' },
      { value: null, label: 'NULL' },
      { value: undefined, label: 'undefined' },
    ].forEach(({ value, label }) => {
      test(`it should return true when sex value is ${label}`, function (assert) {
        // given
        const certification = store.createRecord('certification', {
          sex: value,
        });

        // then
        assert.true(certification.wasRegisteredBeforeCPF);
      });
    });

    test('should return false when sex is defined', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        sex: 'M',
      });

      // then
      assert.false(certification.wasRegisteredBeforeCPF);
    });
  });

  module('#get completionDate', function () {
    test('it should return null if completedAt is null', function (assert) {
      // given
      const juryCertificationSummary = store.createRecord('certification', { completedAt: null });

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(juryCertificationSummary.completionDate, null);
    });

    test('it should a formatted date when completedAt is defined', function (assert) {
      // given
      const juryCertificationSummary = store.createRecord('certification', { completedAt: '2021-06-30 15:10:45' });

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(juryCertificationSummary.completionDate, '30/06/2021, 15:10:45');
    });
  });

  module('#getInformation', function () {
    test('it should return the certification candidate information', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });

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

  module('#updateInformation', function () {
    test('it should update the certification candidate information', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });

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

  module('#wasBornInFrance', function () {
    test('it should return true when candidate was born in France', function (assert) {
      // given
      const certification = store.createRecord('certification', { birthCountry: 'FRANCE' });

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.true(wasBornInFrance);
    });

    test('it should return false when candidate was not born in France', function (assert) {
      // given
      const certification = store.createRecord('certification', { birthCountry: 'OTHER_COUNTRY' });

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.false(wasBornInFrance);
    });
  });
});
