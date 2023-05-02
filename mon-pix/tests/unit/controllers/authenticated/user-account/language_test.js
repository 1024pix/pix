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
      test('saves user language and update application locale', async function (assert) {
        // given
        const language = 'en';

        controller.currentDomain = { isFranceDomain: false };

        // when
        await controller.onLanguageChange(language);

        // then
        sinon.assert.calledWith(userSaveStub, { adapterOptions: { lang: language } });
        sinon.assert.calledWith(dayjsSetLocaleStub, language);
        sinon.assert.calledWith(intlSetLocaleStub, language);
        assert.ok(true);
      });
    });
    module('when in France domain', function () {
      test('does not save user language and update application locale', async function (assert) {
        // given
        const language = 'en';

        controller.currentDomain = { isFranceDomain: true };

        // when
        await controller.onLanguageChange(language);

        // then
        sinon.assert.notCalled(userSaveStub);
        sinon.assert.notCalled(dayjsSetLocaleStub);
        sinon.assert.notCalled(intlSetLocaleStub);
        assert.ok(true);
      });
    });
  });
});
