import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | new-candidate-modal', function (hooks) {
  setupTest(hooks);

  let modal;

  hooks.beforeEach(function () {
    modal = createGlimmerComponent('component:new-candidate-modal');
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
        assert.strictEqual(modal.selectedBirthGeoCodeOption, 'insee');
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
          '',
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
        assert.strictEqual(modal.selectedBirthGeoCodeOption, 'postal');
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
          '',
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
          '99',
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
        id: 0,
        label: 'Certif complémentaire 1',
        key: 'COMP_0',
      };

      // when
      modal.updateComplementaryCertification(complementaryCertification);

      // then
      assert.deepEqual(modal.args.candidateData.complementaryCertification, complementaryCertification);
    });

    test('it should not be possible to select multiple complementary certifications', function (assert) {
      // given
      const firstComplementaryCertification = {
        id: 1,
        label: 'firstComplementaryCertification',
        key: 'COMP_1',
      };
      const secondComplementaryCertification = {
        id: 2,
        label: 'secondComplementaryCertification',
        key: 'COMP_2',
      };
      modal.args.candidateData = {
        complementaryCertification: firstComplementaryCertification,
      };

      // when
      modal.updateComplementaryCertification(secondComplementaryCertification);

      // then
      assert.deepEqual(modal.args.candidateData.complementaryCertification, secondComplementaryCertification);
    });

    test('it should remove the complementary when no complementary is selected', function (assert) {
      // given
      modal.args.candidateData = {
        complementaryCertification: {
          id: 0,
          label: 'Certif complémentaire 1',
          key: 'COMP_0',
        },
      };

      const noneChoice = {
        target: { value: 'none' },
      };

      // when
      modal.updateComplementaryCertification(noneChoice);

      // then
      assert.strictEqual(typeof modal.args.candidateData.complementaryCertification, 'undefined');
    });
  });

  module('#isComplementaryAlonePilot', function () {
    module('when certification center is a complementary alone pilot', function () {
      test('it should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isComplementaryAlonePilot: true,
        });
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const isComplementaryAlonePilot = modal.isComplementaryAlonePilot;

        // then
        assert.true(isComplementaryAlonePilot);
      });
    });

    module('when certification center is not a complementary alone pilot', function () {
      test('it should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          isComplementaryAlonePilot: false,
        });
        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }

        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const isComplementaryAlonePilot = modal.isComplementaryAlonePilot;

        // then
        assert.false(isComplementaryAlonePilot);
      });
    });
  });
});
