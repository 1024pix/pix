import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | absolute-url', function (hooks) {
  setupTest(hooks);

  const options = { message: "Le lien n'est pas valide." };

  test('it does not returns an error message when url is empty', async function (assert) {
    const validator = this.owner.lookup('validator:absolute-url');
    const emptyUrl = '';

    const message = await validator.validate(emptyUrl, { ...options, allowBlank: true });

    assert.true(message);
  });

  test('it returns an error message when url does not start with http(s)://', async function (assert) {
    const validator = this.owner.lookup('validator:absolute-url');
    const badUrl = 'google.com';

    const message = await validator.validate(badUrl, options);

    assert.strictEqual(message, options.message);
  });

  test('it does not return an error message when url starts with http://', async function (assert) {
    const validator = this.owner.lookup('validator:absolute-url');
    const goodUrl = 'http://google.com';

    const message = await validator.validate(goodUrl, options);

    assert.true(message);
  });

  test('it does not return an error message when url starts with https://', async function (assert) {
    const validator = this.owner.lookup('validator:absolute-url');
    const goodUrl = 'https://google.com';

    const message = await validator.validate(goodUrl, options);

    assert.true(message);
  });

  test('it returns an error message when url does not end with domain extension', async function (assert) {
    const validator = this.owner.lookup('validator:absolute-url');
    const badUrl = 'http://google';

    const message = await validator.validate(badUrl, options);

    assert.strictEqual(message, options.message);
  });
});
