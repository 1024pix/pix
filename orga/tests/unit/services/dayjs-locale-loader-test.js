// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import dayjs from 'dayjs';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Services | dayjs-locale-loader', function (hooks) {
  let dayjsLocaleLoaderService;

  setupTest(hooks);

  hooks.beforeEach(function () {
    dayjsLocaleLoaderService = this.owner.lookup('service:dayjs-locale-loader');
    sinon.stub(dayjs, 'locale');
  });
  test('loads daysjs language file from locale', async function (assert) {
    // when
    await dayjsLocaleLoaderService.load('de-AT');
    // then
    assert.ok(dayjs.locale.calledOnceWith('de'));
  });
  test('throws if language is not supported', function (assert) {
    // when and then
    assert.rejects(dayjsLocaleLoaderService.load('ja-JP'), /Language not supported/);
  });
});
