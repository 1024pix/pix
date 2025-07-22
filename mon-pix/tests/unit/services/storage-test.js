import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | storage', function (hooks) {
  setupTest(hooks);
  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:storage');
  });

  module('login', function () {
    test('setLogin', function (assert) {
      // given
      const login = 'someone@example.net';

      // when
      service.setLogin(login);

      // then
      assert.strictEqual(sessionStorage.getItem('PIX_LOGIN'), login);
    });

    test('getLogin', function (assert) {
      // given
      const login = 'someone@example.net';
      sessionStorage.setItem('PIX_LOGIN', login);

      // when
      const result = service.getLogin();

      // then
      assert.strictEqual(result, login);
    });

    test('getLogin with no login', function (assert) {
      // given
      sessionStorage.clear();

      // when
      const result = service.getLogin();

      // then
      assert.strictEqual(result, null);
    });
  });

  module('text to speech', function () {
    test('should return the value of text to speech if is not null', function (assert) {
      // given
      localStorage.setItem('PIX_TEXT_TO_SPEECH', true);

      // when
      const result = service.getTextToSpeech();

      // then
      assert.true(result);
    });

    test('should set the value correctly', function (assert) {
      // when
      service.setTextToSpeech(true);

      // then
      assert.strictEqual(localStorage.getItem('PIX_TEXT_TO_SPEECH'), 'true');
    });

    test('return true if value is not defined in localstorage', function (assert) {
      // given
      localStorage.removeItem('PIX_TEXT_TO_SPEECH');

      // when
      const result = service.getTextToSpeech();

      // then
      assert.true(result);
    });
  });
});
