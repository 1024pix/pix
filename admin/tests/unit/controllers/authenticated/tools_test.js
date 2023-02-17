import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/tools', function (hooks) {
  setupTest(hooks);

  const files = Symbol('files');
  let controller;
  let importFilesStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');
    controller = this.owner.lookup('controller:authenticated/tools');

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('import-files');
    importFilesStub = sinon.stub(adapter, 'importCampaignsToArchive');
  });

  module('#importCampaignsToArchive', function () {
    module('when file is csv', function () {
      test('it sends the chosen csv file to the API', async function (assert) {
        controller.notifications.success = sinon.spy();
        await controller.archiveCampaigns(files);

        assert.ok(importFilesStub.calledWith(files));
        assert.ok(controller.notifications.success.calledWith('Toutes les campagnes ont été archivées.'));
      });
    });

    module('when the error is HEADER_REQUIRED', function () {
      test('it display a notification about the missing header', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'HEADER_REQUIRED' }] });
        controller.notifications.error = sinon.spy();

        // when
        await controller.archiveCampaigns(files);

        // then
        assert.ok(controller.notifications.error.calledOnceWith("La colonne campaignId n'est pas présente."));
      });
    });

    module('when the error is HEADER_UNKNOWN', function () {
      test('it display a notification about the unexpected column', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'HEADER_UNKNOWN' }] });
        controller.notifications.error = sinon.spy();

        // when
        await controller.archiveCampaigns(files);

        // then
        assert.ok(
          controller.notifications.error.calledOnceWith('Une colonne dans le fichier ne devrait pas être présente.')
        );
      });
    });

    module('when the error is ENCODING_NOT_SUPPORTED', function () {
      test('it display a notification about the unexpected enooding', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'ENCODING_NOT_SUPPORTED' }] });
        controller.notifications.error = sinon.spy();

        // when
        await controller.archiveCampaigns(files);

        // then
        assert.ok(controller.notifications.error.calledOnceWith('Encodage non supporté.'));
      });
    });

    module('when the error is something else', function () {
      test('it display a generic notification', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'OTHER_ERROR' }] });
        controller.notifications.error = sinon.spy();

        // when
        await controller.archiveCampaigns(files);

        // then
        assert.ok(controller.notifications.error.calledOnceWith('Une erreur est survenue. OUPS...'));
      });
    });
  });
});
