import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | user-logged-menu', function (hooks) {
  setupRenderingTest(hooks);
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
    await render(hbs`<UserLoggedMenu/>`);

    // then
    assert.contains('Buffy Summers');
  });

  module("when certification center doesn't have an externalId", function () {
    test('should display the user certification center name only', async function (assert) {
      // given
      currentAllowedCertificationCenterAccess.externalId = '';

      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.contains('Sunnydale');
      assert.notContains('(');
    });
  });

  module('when certification center does have an externalId', function () {
    test('should display the user certification center name and certification center externalId', async function (assert) {
      // given
      currentAllowedCertificationCenterAccess.externalId = 'GILES123';

      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.contains('Sunnydale (GILES123)');
    });
  });

  module('when menu is closed', function () {
    test('should display the chevron-down icon', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom('.fa-chevron-down').exists();
      assert.dom('.fa-chevron-up').doesNotExist();
    });

    test('should hide the disconnect link', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await clickByLabel('Buffy Summers Sunnydale');
      await clickByLabel('Buffy Summers Sunnydale');

      // then
      assert.dom('.logged-user-menu-item__last').doesNotExist();
    });
  });

  module('when menu is open', function () {
    test('should display the chevron-up icon', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await clickByLabel('Buffy Summers Sunnydale');

      // then
      assert.dom('.fa-chevron-up').exists();
      assert.dom('.fa-chevron-down').doesNotExist();
    });

    test('should display the disconnect link', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await clickByLabel('Buffy Summers Sunnydale');

      // then
      assert.dom('.logged-user-menu-item__last').exists();
      assert.contains('Se déconnecter');
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
      await render(hbs`<UserLoggedMenu />`);
      await clickByLabel('Buffy Summers Sunnydale');

      // then
      assert.contains('Torreilles');
      assert.contains('(externalId1)');
      assert.contains('Paris');
      assert.contains('(ILPlEUT)');
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
      await render(
        hbs`<UserLoggedMenu @onCertificationCenterAccessChanged={{this.onCertificationAccessChangedStub}}/>`
      );
      await clickByLabel('Buffy Summers Sunnydale');
      await clickByLabel('Torreilles (externalId1)');

      // then
      assert.dom('.fa-chevron-down').exists();
      assert.dom('.fa-chevron-up').doesNotExist();
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
      await render(
        hbs`<UserLoggedMenu @onCertificationCenterAccessChanged={{this.onCertificationAccessChangedStub}}/>`
      );
      await clickByLabel('Buffy Summers Sunnydale');
      await clickByLabel('Torreilles (externalId1)');

      // then
      sinon.assert.calledWithExactly(this.onCertificationAccessChangedStub, allowedCertificationCenterAccessA);
      assert.ok(true);
    });
  });
});
