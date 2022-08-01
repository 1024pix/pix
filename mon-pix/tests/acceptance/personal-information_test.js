import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { authenticateByEmail } from '../helpers/authentication';

module('Acceptance | personal-information', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is connected', function () {
    test('should display user personal information', async function (assert) {
      // given
      const user = server.create('user', {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        username: 'john.doe0101',
        password: 'pixi',
        lang: 'fr',
      });
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/informations-personnelles');

      // then
      assert.dom(contains(user.firstName)).exists();
      assert.dom(contains(user.lastName)).exists();
    });
  });
});
