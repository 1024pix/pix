import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | User tests', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    test('can visit /mes-parcours', async function (assert) {
      //given
      server.create('campaign-participation-overview', {
        assessmentState: 'started',
        campaignCode: '123',
        campaignTitle: 'Campaign 1',
        createdAt: new Date('2020-04-20T04:05:06Z'),
        isShared: false,
      });

      // when
      await visit('/mes-parcours');

      // then
      assert.strictEqual(currentURL(), '/mes-parcours');
    });

    test('should display user participation cards', async function (assert) {
      // given
      server.create('campaign-participation-overview', {
        assessmentState: 'started',
        campaignCode: '123',
        campaignTitle: 'Campaign 1',
        createdAt: new Date('2020-04-20T04:05:06Z'),
        isShared: false,
      });
      server.create('campaign-participation-overview', {
        assessmentState: 'completed',
        campaignCode: '123',
        campaignTitle: 'Campaign 2',
        createdAt: new Date('2020-05-20T04:05:06Z'),
        isShared: false,
      });

      // when
      await visit('/mes-parcours');

      // then
      assert.ok(contains('Campaign 1'));
      assert.ok(contains('Campaign 2'));
    });
  });

  module('Not authenticated cases', function () {
    test('should redirect to home, when user is not authenticated', async function (assert) {
      // when
      await visit('/mes-parcours');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });
});
