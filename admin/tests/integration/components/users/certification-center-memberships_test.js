import { clickByName, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | users | certification-center-memberships', function (hooks) {
  setupRenderingTest(hooks);

  module('When user isn’t member of any certification center', function () {
    test('it should display an empty table', async function (assert) {
      // given
      this.set('certificationCenterMemberships', []);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucun centre de certification')).exists();
    });
  });

  module('When user is member of some certification centers', function () {
    test('it should display a table of the certification centers the user is member of', async function (assert) {
      // given
      const certificationCenter = EmberObject.create('certification-center', {
        id: '123',
        name: 'Centre Kaede',
        externalId: 'ABCDEF12345',
        type: 'SCO',
      });
      const certificationCenterMembership = EmberObject.create('certification-center-membership', {
        id: '456',
        certificationCenter,
      });

      this.set('certificationCenterMemberships', [certificationCenterMembership]);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
      );

      // then
      assert.dom(screen.getByText('Centre Kaede')).exists();
    });
  });

  test('it should be possible to deactivate a certification center membership from a pix certification center user', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const pixCertifUser = store.createRecord('user', { firstName: 'Gaara' });
    const certificationCenter = store.createRecord('certification-center', {
      id: 123,
      name: 'Suna Center',
      externalId: 'S4BL3',
      type: 'SCO',
    });

    const certificationCenterMembership = store.createRecord('certification-center-membership', {
      id: 456789,
      certificationCenter,
      user: pixCertifUser,
      destroyRecord: sinon.stub().resolves(),
    });
    this.set('certificationCenterMemberships', [certificationCenterMembership]);

    const notificationSuccessStub = sinon.stub();

    class NotificationsStub extends Service {
      success = notificationSuccessStub;
    }
    this.owner.register('service:notifications', NotificationsStub);

    // when
    await render(
      hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
    );
    await clickByName('Désactiver');

    // then
    assert.ok(certificationCenterMembership.destroyRecord.called);
    sinon.assert.calledWith(notificationSuccessStub, 'Le membre a correctement été désactivé.');
  });

  test('it should display an error message when it is not possible to deactivate a certification center membership from a pix certification center user', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const pixCertifUser = store.createRecord('user', { firstName: 'Nagato' });
    const certificationCenter = store.createRecord('certification-center', {
      id: '123',
      name: 'Ame Center',
      externalId: 'PLU1E',
      type: 'SCO',
    });

    const certificationCenterMembership = store.createRecord('certification-center-membership', {
      id: 456789,
      certificationCenter,
      user: pixCertifUser,
      destroyRecord: sinon.stub().rejects(),
    });
    this.set('certificationCenterMemberships', [certificationCenterMembership]);

    const notificationErrorStub = sinon.stub();

    class NotificationsStub extends Service {
      error = notificationErrorStub;
    }
    this.owner.register('service:notifications', NotificationsStub);

    // when
    await render(
      hbs`<Users::CertificationCenterMemberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
    );
    await clickByName('Désactiver');

    // then
    assert.ok(certificationCenterMembership.destroyRecord.called);
    sinon.assert.calledWith(notificationErrorStub, "Une erreur est survenue, le membre n'a pas été désactivé.");
  });
});
