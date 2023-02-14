import { module, test } from 'qunit';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | user-logged-menu', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  let certificationPointOfContact;
  let currentAllowedCertificationCenterAccess;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    currentAllowedCertificationCenterAccess = run(() =>
      store.createRecord('allowed-certification-center-access', {
        id: 123,
        name: 'Sunnydale',
      })
    );
    certificationPointOfContact = run(() =>
      store.createRecord('certification-point-of-contact', {
        firstName: 'Buffy',
        lastName: 'Summers',
      })
    );
    class CurrentUserStub extends Service {
      certificationPointOfContact = certificationPointOfContact;
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test("should display user's firstName and lastName", async function (assert) {
    // when
    const screen = await renderScreen(hbs`<UserLoggedMenu/>`);

    // then
    assert.dom(screen.getByText('Buffy Summers')).exists();
  });

  module("when certification center doesn't have an externalId", function () {
    test('should display the user certification center name only', async function (assert) {
      // given
      currentAllowedCertificationCenterAccess.externalId = '';

      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom(screen.getByText('Sunnydale')).exists();
    });
  });

  module('when certification center does have an externalId', function () {
    test('should display the user certification center name and certification center externalId', async function (assert) {
      // given
      currentAllowedCertificationCenterAccess.externalId = 'GILES123';

      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom(screen.getByText('Sunnydale (GILES123)')).exists();
    });
  });

  module('when menu is closed', function () {
    test('([a11y] should indicate that the menu is not displayed', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' })).hasAria('expanded', 'false');
    });

    test('should hide the disconnect link', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));

      // then
      assert.dom(screen.queryByRole('link', { name: 'Se déconnecter' })).doesNotExist();
    });
  });

  module('when menu is open', function () {
    test('([a11y] should indicate that the menu is displayed', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' })).hasAria('expanded', 'true');
    });

    test('should display the disconnect link', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));

      // then
      assert.dom(screen.getByRole('link', { name: 'Se déconnecter' })).exists();
    });

    test('should display the certification centers name and externalId of all allowed ones of the user', async function (assert) {
      // given
      const allowedCertificationCenterAccessA = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 456,
          name: 'Torreilles',
          externalId: 'externalId1',
        })
      );
      const allowedCertificationCenterAccessB = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 789,
          name: 'Paris',
          externalId: 'ILPlEUT',
        })
      );
      certificationPointOfContact.set('allowedCertificationCenterAccesses', [
        currentAllowedCertificationCenterAccess,
        allowedCertificationCenterAccessA,
        allowedCertificationCenterAccessB,
      ]);

      // when
      const screen = await renderScreen(hbs`<UserLoggedMenu/>`);
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));

      // then
      assert.dom(screen.getByRole('button', { name: 'Torreilles (externalId1)' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Paris (ILPlEUT)' })).exists();
    });
  });

  module('when clicking on a menu item', function () {
    test('should close the menu', async function (assert) {
      // given
      const allowedCertificationCenterAccessA = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 456,
          name: 'Torreilles',
          externalId: 'externalId1',
        })
      );
      certificationPointOfContact.set('allowedCertificationCenterAccesses', [
        currentAllowedCertificationCenterAccess,
        allowedCertificationCenterAccessA,
      ]);
      this.onCertificationAccessChangedStub = sinon.stub();

      // when
      const screen = await renderScreen(
        hbs`<UserLoggedMenu @onCertificationCenterAccessChanged={{this.onCertificationAccessChangedStub}}/>`
      );
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));
      await click(screen.getByRole('button', { name: 'Torreilles (externalId1)' }));

      // then
      assert.dom(screen.queryByRole('button', { name: 'Torreilles (externalId1)' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Se déconnecter' })).doesNotExist();
    });

    test('should call the "onCertificationCenterAccessChanged" function', async function (assert) {
      // given
      const allowedCertificationCenterAccessA = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 456,
          name: 'Torreilles',
          externalId: 'externalId1',
        })
      );
      certificationPointOfContact.set('allowedCertificationCenterAccesses', [
        currentAllowedCertificationCenterAccess,
        allowedCertificationCenterAccessA,
      ]);
      this.onCertificationAccessChangedStub = sinon.stub();

      // when
      const screen = await renderScreen(
        hbs`<UserLoggedMenu @onCertificationCenterAccessChanged={{this.onCertificationAccessChangedStub}}/>`
      );
      await click(screen.getByRole('link', { name: 'Buffy Summers Sunnydale' }));
      await click(screen.getByRole('button', { name: 'Torreilles (externalId1)' }));

      // then
      sinon.assert.calledWithExactly(this.onCertificationAccessChangedStub, allowedCertificationCenterAccessA);
      assert.ok(true);
    });
  });
});
