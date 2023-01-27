import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { triggerEvent } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/organizations-import', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('when import succeeds', function () {});
  test('it displays a success notification', async function (assert) {
    // given
    const file = new Blob(['foo'], { type: `valid-file` });
    const notificationSuccessStub = sinon.stub();
    class NotificationsStub extends Service {
      success = notificationSuccessStub;
      clearAll = sinon.stub();
    }
    this.owner.register('service:notifications', NotificationsStub);

    // when
    const screen = await render(hbs`<Administration::OrganizationsImport />`);
    const input = await screen.findByLabelText(
      this.intl.t('components.administration.organizations-import.upload-button')
    );
    await triggerEvent(input, 'change', { files: [file] });

    // then
    assert.ok(true);
    sinon.assert.calledWith(
      notificationSuccessStub,
      this.intl.t('components.administration.organizations-import.notifications.success')
    );
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      this.server.post(
        '/admin/organizations/import-csv',
        () =>
          new Response(
            412,
            {},
            { errors: [{ status: '412', title: "Un soucis avec l'import", code: '412', detail: 'Erreur d’import' }] }
          ),
        412
      );
      const file = new Blob(['foo'], { type: `valid-file` });
      const notificationErrorStub = sinon.stub().returns();
      class NotificationsStub extends Service {
        error = notificationErrorStub;
        clearAll = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(hbs`<Administration::OrganizationsImport />`);
      const input = await screen.findByLabelText(
        this.intl.t('components.administration.organizations-import.upload-button')
      );
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(notificationErrorStub.called);
    });
  });
});
