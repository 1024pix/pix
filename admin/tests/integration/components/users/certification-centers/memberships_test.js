import { module, test } from 'qunit';
import { render, clickByName } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | users | certification-centers | memberships', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('When user isn’t member of any certification center', function () {
    test('displays an empty table', async function (assert) {
      // given
      this.set('certificationCenterMemberships', []);

      // when
      const screen = await render(
        hbs`<Users::CertificationCenters::Memberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucun centre de certification')).exists();
    });
  });

  module('When user is member of some certification centers', function () {
    test('displays a table of the certification centers the user is member of', async function (assert) {
      // given
      const certificationCenter = store.createRecord('certification-center', {
        id: '123',
        name: 'Centre Kaede',
        externalId: 'ABCDEF12345',
        type: 'SCO',
      });
      const certificationCenterMembership = store.createRecord('certification-center-membership', {
        id: '456',
        certificationCenter,
        role: 'MEMBER',
      });

      this.set('certificationCenterMemberships', [certificationCenterMembership]);
      this.set('onCertificationCenterMembershipRoleChange', sinon.stub());
      this.set('disableCertificationCenterMembership', sinon.stub());

      // when
      const screen = await render(
        hbs`<Users::CertificationCenters::Memberships 
          @certificationCenterMemberships={{this.certificationCenterMemberships}}
          @onCertificationCenterMembershipRoleChange={{this.updateCertificationCenterMembershipRole}}
          @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
        />`,
      );

      // then
      assert.dom(screen.getByText('Centre Kaede')).exists();
      assert.dom(screen.getByText('Membre')).exists();
    });
  });

  test('deactivates a certification center membership from a pix certification center user', async function (assert) {
    // given
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
      role: 'MEMBER',
      destroyRecord: sinon.stub(),
    });
    this.set('certificationCenterMemberships', [certificationCenterMembership]);
    this.set('onCertificationCenterMembershipRoleChange', sinon.stub());
    this.set('disableCertificationCenterMembership', sinon.stub().resolves());

    const notificationSuccessStub = sinon.stub();

    class NotificationsStub extends Service {
      success = notificationSuccessStub;
    }
    this.owner.register('service:notifications', NotificationsStub);

    // when
    await render(
      hbs`<Users::CertificationCenters::Memberships 
        @certificationCenterMemberships={{this.certificationCenterMemberships}} 
        @onCertificationCenterMembershipRoleChange={{this.updateCertificationCenterMembershipRole}}
        @disableCertificationCenterMembership={{this.disableCertificationCenterMembership}}
      />`,
    );
    await clickByName('Désactiver');

    // then
    assert.ok(certificationCenterMembership.destroyRecord.called);
    sinon.assert.calledWith(notificationSuccessStub, 'Le membre a correctement été désactivé.');
  });

  test('displays an error message when it is not possible to deactivate a certification center membership from a pix certification center user', async function (assert) {
    // given
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
      role: 'MEMBER',
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
      hbs`<Users::CertificationCenters::Memberships @certificationCenterMemberships={{this.certificationCenterMemberships}} />`,
    );
    await clickByName('Désactiver');

    // then
    assert.ok(certificationCenterMembership.destroyRecord.called);
    sinon.assert.calledWith(notificationErrorStub, "Une erreur est survenue, le membre n'a pas été désactivé.");
  });
});
