// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import dayjs from 'dayjs';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Services | locale-loader', function (hooks) {
  let intlService;
  let localeLoaderService;

  setupTest(hooks);

  hooks.beforeEach(function () {
    localeLoaderService = this.owner.lookup('service:locale-loader');
    intlService = this.owner.lookup('service:intl');
    sinon.stub(intlService, 'addTranslations');
    sinon.stub(dayjs, 'locale');
  });
  test('loads daysjs language file from locale', async function (assert) {
    // when
    await localeLoaderService.load('de-AT');
    // then
    assert.ok(dayjs.locale.calledOnceWith('de'));
  });

  test('loads intl language file from locale', async function (assert) {
    // when
    await localeLoaderService.load('de-AT');
    // then
    assert.ok(intlService.addTranslations.calledOnceWith('de'));
  });
  test('throws if language is not supported', function (assert) {
    // when and then
    assert.rejects(localeLoaderService.load('ja-JP'), /Language not supported/);
  });
});
