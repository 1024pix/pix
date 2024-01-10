import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | language-switcher', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('language-switcher');
  });

  module('#mapToOptions', function () {
    test('sorts languages with french international language first', function (assert) {
      // given
      const languages = {
        en: {
          value: 'English',
          languageSwitcherDisplayed: true,
        },
        fr: {
          value: 'Français',
          languageSwitcherDisplayed: true,
        },
      };

      // when
      const result = component.mapToOptions(languages);

      // then
      const expectedResult = {
        label: 'Français',
        value: 'fr',
      };

      assert.deepEqual(result[0], expectedResult);
    });

    test('sorts other languages by "value"', function (assert) {
      // given
      const languages = {
        en: {
          value: 'English',
          languageSwitcherDisplayed: true,
        },
        es: {
          value: 'Spanish',
          languageSwitcherDisplayed: true,
        },
        fr: {
          value: 'Français',
          languageSwitcherDisplayed: true,
        },
      };

      // when
      const result = component.mapToOptions(languages);

      // then
      const expectedResult = [
        {
          label: 'Français',
          value: 'fr',
        },
        {
          label: 'English',
          value: 'en',
        },
        {
          label: 'Spanish',
          value: 'es',
        },
      ];
      assert.deepEqual(result, expectedResult);
    });

    module('when languages have attribute "languageSwitcherDisplayed" at "false"', function () {
      test(`does not map these languages`, function (assert) {
        // given
        const languages = {
          fr: {
            value: 'Français',
            languageSwitcherDisplayed: true,
          },
          en: {
            value: 'English',
            languageSwitcherDisplayed: false,
          },
          es: {
            value: 'Spanish',
            languageSwitcherDisplayed: false,
          },
        };

        // when
        const result = component.mapToOptions(languages);

        // then
        const expectedResult = [
          {
            label: 'Français',
            value: 'fr',
          },
        ];
        assert.deepEqual(result, expectedResult);
      });
    });
  });
});
