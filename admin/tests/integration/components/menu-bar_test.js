import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | menu-bar', function (hooks) {
  setupRenderingTest(hooks);

  test('should contain link to "organizations" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Organisations')).exists();
  });

  module('Team tab', function () {
    test('should contain link to "team" management page when admin member have "SUPER_ADMIN" as role', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };

      // when
      const screen = await render(hbs`{{menu-bar}}`);

      // then
      assert.dom(screen.getByTitle('Équipe')).exists();
    });

    test('should not contain link to "team" management page when admin member have "SUPPORT", "CERTIF" or "METIER" as role', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: false };

      // when
      const screen = await render(hbs`{{menu-bar}}`);

      // then
      assert.throws(() => screen.getByTitle('Équipe'), 'HTMLElement not found');
    });
  });

  test('should contain link to "users" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Utilisateurs')).exists();
  });

  test('should contain link to "sessions" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Sessions de certifications')).exists();
  });

  test('should contain link to "certifications" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Certifications')).exists();
  });

  test('should contain link to "certification centers" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Centres de certification')).exists();
  });

  test('should contain link to "target-profiles" management page', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Profils cibles')).exists();
  });

  module('Tools tab', function () {
    module('when user is Super Admin', function () {
      test('should contain link to "tools" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        // when
        const screen = await render(hbs`{{menu-bar}}`);

        // then
        assert.dom(screen.getByTitle('Outils')).exists();
      });
    });

    module('when user is Certif, Metier or Support', function () {
      test('should not contain link to "tools" management page', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false };

        // when
        const screen = await render(hbs`{{menu-bar}}`);

        // then
        assert.dom(screen.queryByText('Outils')).doesNotExist();
      });
    });
  });

  test('should contain link to "logout"', async function (assert) {
    // when
    const screen = await render(hbs`{{menu-bar}}`);

    // then
    assert.dom(screen.getByTitle('Se déconnecter')).exists();
  });
});
