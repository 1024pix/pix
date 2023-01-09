import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | new-certification-candidate-modal', function (hooks) {
  setupTest(hooks);

  let modal;

  hooks.beforeEach(function () {
    modal = createGlimmerComponent('component:new-certification-candidate-modal');
  });

  module('#selectBirthGeoCodeOption', function () {
    module('when birth geo code option is postal', function (hooks) {
      hooks.beforeEach(function () {
        modal.selectedBirthGeoCodeOption = 'postal';
      });

      test('should set the birth geo code option to insee', async function (assert) {
        // given
        modal.args.updateCandidateDataFromValue = sinon.stub();

        // when
        await modal.selectBirthGeoCodeOption('insee');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(modal.selectedBirthGeoCodeOption, 'insee');
      });

      test('should reset the birth city', async function (assert) {
        // given
        modal.args.updateCandidateDataFromValue = sinon.stub();
        modal.args.candidateData = { birthCity: 'Saint Malo' };

        // when
        await modal.selectBirthGeoCodeOption('insee');

        // then
        sinon.assert.calledWith(modal.args.updateCandidateDataFromValue, modal.args.candidateData, 'birthCity', '');
        assert.ok(true);
      });

      test('should reset the birth postal code', async function (assert) {
        // given
        modal.args.updateCandidateDataFromValue = sinon.stub();
        modal.args.candidateData = { birthPostalCode: '35400' };

        // when
        await modal.selectBirthGeoCodeOption('insee');

        // then
        sinon.assert.calledWith(
          modal.args.updateCandidateDataFromValue,
          modal.args.candidateData,
          'birthPostalCode',
          ''
        );
        assert.ok(true);
      });
    });

    module('when birth geo code is insee', function (hooks) {
      hooks.beforeEach(function () {
        modal.selectedBirthGeoCodeOption = 'insee';
      });

      test('should set the birth geo code option to postal', async function (assert) {
        // given
        modal.args.updateCandidateDataFromValue = sinon.stub();

        // when
        await modal.selectBirthGeoCodeOption('postal');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(modal.selectedBirthGeoCodeOption, 'postal');
      });

      test('should reset the birth insee code', async function (assert) {
        // given
        modal.args.candidateData = { birthInseeCode: '35288' };
        modal.args.updateCandidateDataFromValue = sinon.stub();

        // when
        await modal.selectBirthGeoCodeOption('postal');

        // then
        sinon.assert.calledWith(
          modal.args.updateCandidateDataFromValue,
          modal.args.candidateData,
          'birthInseeCode',
          ''
        );
        assert.ok(true);
      });
    });
  });

  module('#selectBirthCountry', function () {
    const FRANCE_INSEE_CODE = '99100';

    module('when selected country is France', function (hooks) {
      hooks.beforeEach(function () {
        modal.selectedCountryInseeCode = FRANCE_INSEE_CODE;
      });

      test('should set the birthInseeCode to 99', async function (assert) {
        // given
        modal.args.countries = [
          {
            name: 'Italy',
            code: '99127',
          },
          {
            name: 'France',
            code: '99100',
          },
        ];
        modal.args.updateCandidateDataFromValue = sinon.stub();

        // when
        const optionSelected = '99127';
        await modal.selectBirthCountry(optionSelected);

        // then
        sinon.assert.calledWith(
          modal.args.updateCandidateDataFromValue,
          modal.args.candidateData,
          'birthInseeCode',
          '99'
        );
        assert.ok(true);
      });
    });
  });

  module('#isBirthGeoCodeQuired', function () {
    module('when selected country is Italy', function () {
      test('should return false for Italy', async function (assert) {
        // when
        modal.selectedCountryInseeCode = '99127';

        // then
        assert.false(modal.isBirthGeoCodeRequired);
      });
    });

    module('when selected country is France', function () {
      test('should return true for France', function (assert) {
        // when
        modal.selectedCountryInseeCode = '99100';

        // then
        assert.true(modal.isBirthGeoCodeRequired);
      });
    });
  });

  module('#isInseeCodeOptionSelected', function () {
    test('should return true if selected code option is insee', async function (assert) {
      // given
      modal.args.updateCandidateDataFromValue = sinon.stub();

      // when
      await modal.selectBirthGeoCodeOption('insee');

      // then
      assert.true(modal.isInseeCodeOptionSelected);
    });
  });

  module('#isPostalCodeOptionSelected', function () {
    test('should return true if selected code option is postal', async function (assert) {
      // given
      modal.args.updateCandidateDataFromValue = sinon.stub();

      // when
      await modal.selectBirthGeoCodeOption('postal');

      // then
      assert.true(modal.isPostalCodeOptionSelected);
    });
  });

  module('#isBirthInseeCodeRequired', function () {
    module('when selected country is other than France', function () {
      test('should return false for other than France', async function (assert) {
        // when
        modal.selectedCountryInseeCode = '99123';

        // then
        assert.false(modal.isBirthInseeCodeRequired);
      });
    });

    module('when selected country is France', function () {
      test('should return true for insee code option', async function (assert) {
        // when
        modal.selectedCountryInseeCode = '99100';
        modal.selectedBirthGeoCodeOption = 'insee';

        // then
        assert.true(modal.isBirthInseeCodeRequired);
      });

      test('should return false for postal code option', async function (assert) {
        // when
        modal.selectedCountryInseeCode = '99100';
        modal.selectedBirthGeoCodeOption = 'postal';

        // then
        assert.false(modal.isBirthInseeCodeRequired);
      });
    });
  });

  module('#isBirthPostalCodeRequired', function () {
    test('should return true for postal code option', async function (assert) {
      // when
      modal.selectedBirthGeoCodeOption = 'postal';

      // then
      assert.true(modal.isBirthPostalCodeRequired);
    });

    test('should return false for insee code option', async function (assert) {
      // when
      modal.selectedBirthGeoCodeOption = 'insee';

      // then
      assert.false(modal.isBirthPostalCodeRequired);
    });
  });

  module('#isBirthCityRequired', function () {
    test('should return true when country is not France', async function (assert) {
      // when
      modal.selectedCountryInseeCode = '99123';

      // then
      assert.true(modal.isBirthCityRequired);
    });

    test('should return true if country is France and postal code option is selected', async function (assert) {
      // when
      modal.selectedCountryInseeCode = '99100';
      modal.selectedBirthGeoCodeOption = 'postal';

      // then
      assert.true(modal.isBirthCityRequired);
    });

    test('should return false if country is France and insee code option is selected', async function (assert) {
      // when
      modal.selectedCountryInseeCode = '99100';
      modal.selectedBirthGeoCodeOption = 'insee';

      // then
      assert.false(modal.isBirthCityRequired);
    });
  });

  module('#countryOptions', function () {
    test('should return a list of countries', async function (assert) {
      // when
      modal.args.countries = [
        { name: 'Wakanda', code: '99817' },
        { name: 'Republic of Gilead', code: '99224' },
      ];

      // then
      assert.deepEqual(modal.countryOptions, [
        { label: 'Wakanda', value: '99817' },
        { label: 'Republic of Gilead', value: '99224' },
      ]);
    });
  });

  module('#updateComplementaryCertification', function () {
    test('it should add the complementary certification to the candidate data', function (assert) {
      // given
      modal.args.candidateData = {};
      const complementaryCertification = {
        label: 'complementaryCertification',
      };

      // when
      modal.updateComplementaryCertification(complementaryCertification);

      // then
      assert.deepEqual(modal.args.candidateData.complementaryCertifications, [complementaryCertification]);
    });

    test('it should not be possible to select multiple complementary certifications', function (assert) {
      // given
      const firstComplementaryCertification = { label: 'firstComplementaryCertification' };
      const secondComplementaryCertification = { label: 'secondComplementaryCertification' };
      modal.args.candidateData = {
        complementaryCertifications: [firstComplementaryCertification],
      };

      // when
      modal.updateComplementaryCertification(secondComplementaryCertification);

      // then
      assert.deepEqual(modal.args.candidateData.complementaryCertifications, [secondComplementaryCertification]);
    });
  });
});
