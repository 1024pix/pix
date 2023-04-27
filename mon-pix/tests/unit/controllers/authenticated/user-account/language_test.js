import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | user-account/language', function (hooks) {
  setupTest(hooks);

  let controller;
  let dayjsSetLocaleStub;
  let intlSetLocaleStub;
  let userSaveStub;

  hooks.beforeEach(function () {
    dayjsSetLocaleStub = sinon.stub();
    intlSetLocaleStub = sinon.stub();
    userSaveStub = sinon.stub();

    controller = this.owner.lookup('controller:authenticated/user-account/language');
    controller.currentUser = { user: { save: userSaveStub } };
    controller.dayjs = { setLocale: dayjsSetLocaleStub };
    controller.intl = { setLocale: intlSetLocaleStub };
  });

  module('#onLanguageChange', function () {
    module('when domain is international', function () {
      test('set app locale and save user language', async function (assert) {
        // given
        const language = 'en';

        controller.currentDomain = { isFranceDomain: false };

        // when
        controller.onLanguageChange(language);

        // then
        sinon.assert.calledWith(dayjsSetLocaleStub, language);
        sinon.assert.calledWith(intlSetLocaleStub, [language]);
        sinon.assert.calledWith(userSaveStub, { adapterOptions: { lang: language } });
        assert.ok(true);
      });
    });
    module('when domain is french', function () {
      test('not set locale and save user language', async function (assert) {
        // given
        const language = 'en';

        controller.currentDomain = { isFranceDomain: true };

        // when
        controller.onLanguageChange(language);

        // then
        sinon.assert.notCalled(dayjsSetLocaleStub);
        sinon.assert.notCalled(intlSetLocaleStub);
        sinon.assert.notCalled(userSaveStub);
        assert.ok(true);
      });
    });
  });
});
