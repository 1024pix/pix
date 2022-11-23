import { findAll } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateByEmail } from '../helpers/authentication';

module('Acceptance | Sitemap', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('When visiting /plan-du-site', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateByEmail(user);
      await visit('/plan-du-site');
    });

    test('should contain a link to pix.fr/accessibilite', async function (assert) {
      // then
      const accessibilityLink = findAll('.sitemap-content-items-link-resources__resource > a')[0];
      assert.ok(accessibilityLink.getAttribute('href').includes('/accessibilite'));
    });

    test('should contain a link to pix.fr/conditions-generales-d-utilisation', async function (assert) {
      // then
      const cguLink = findAll('.sitemap-content-items-link-resources__resource > a')[1];
      assert.ok(cguLink.getAttribute('href').includes('/conditions-generales-d-utilisation'));
    });

    test('should contain a link to pix.fr/aide-accessibilite', async function (assert) {
      // then
      const accessibilityHelpLink = findAll('a[data-test-resource-link]')[0];
      assert.ok(accessibilityHelpLink.getAttribute('href').includes('/aide-accessibilite'));
    });

    test('should contain a link to pix.fr/politique-protection-donnees-personnelles-app', async function (assert) {
      // then
      const cguPolicyLink = findAll('a[data-test-resource-link]')[1];
      assert.ok(cguPolicyLink.getAttribute('href').includes('/politique-protection-donnees-personnelles-app'));
    });

    test('should contain a link to pix.fr/mes-formations', async function (assert) {
      // then
      assert.dom('a[href="/mes-formations"]').exists();
    });
  });
});
