import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';

module('Acceptance | personal-information', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is connected', function () {
    test('should display user personal information', async function (assert) {
      // given
      const user = this.server.create('user', {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        username: 'john.doe0101',
        password: 'pixi',
        lang: 'fr',
      });
      await authenticate(user);

      // when
      const screen = await visit('/mon-compte/informations-personnelles');

      // then
      const userNames = screen.getAllByText(user.firstName).length;
      assert.strictEqual(userNames, 2);
      assert.ok(screen.getByText(user.lastName));
    });
  });
});
