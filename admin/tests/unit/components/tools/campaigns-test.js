import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Components | tools/campaigns', function (hooks) {
  setupTest(hooks);

  const files = Symbol('files');
  let component;
  let importFilesStub;

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('fr');

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('import-files');
    importFilesStub = sinon.stub(adapter, 'importCampaignsToArchive');

    component = createGlimmerComponent('component:tools/campaigns');
  });

  module('#importCampaignsToArchive', function () {
    module('when file is csv', function () {
      test('it sends the chosen csv file to the API', async function (assert) {
        component.pixToast.sendSuccessNotification = sinon.spy();
        await component.archiveCampaigns(files);

        assert.ok(importFilesStub.calledWith(files));
        assert.ok(
          component.pixToast.sendSuccessNotification.calledWith({
            message: 'Toutes les campagnes ont été archivées.',
          }),
        );
      });
    });

    module('when the error is HEADER_REQUIRED', function () {
      test('it display a notification about the missing header', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'HEADER_REQUIRED' }] });
        component.pixToast.sendErrorNotification = sinon.spy();

        // when
        await component.archiveCampaigns(files);

        // then
        assert.ok(
          component.pixToast.sendErrorNotification.calledOnceWith({
            message: "La colonne campaignId n'est pas présente.",
          }),
        );
      });
    });

    module('when the error is HEADER_UNKNOWN', function () {
      test('it display a notification about the unexpected column', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'HEADER_UNKNOWN' }] });
        component.pixToast.sendErrorNotification = sinon.spy();

        // when
        await component.archiveCampaigns(files);

        // then
        assert.ok(
          component.pixToast.sendErrorNotification.calledOnceWith({
            message: 'Une colonne dans le fichier ne devrait pas être présente.',
          }),
        );
      });
    });

    module('when the error is ENCODING_NOT_SUPPORTED', function () {
      test('it display a notification about the unexpected enooding', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'ENCODING_NOT_SUPPORTED' }] });
        component.pixToast.sendErrorNotification = sinon.spy();

        // when
        await component.archiveCampaigns(files);

        // then
        assert.ok(component.pixToast.sendErrorNotification.calledOnceWith({ message: 'Encodage non supporté.' }));
      });
    });

    module('when the error is something else', function () {
      test('it display a generic notification', async function (assert) {
        importFilesStub.rejects({ errors: [{ status: '401', code: 'OTHER_ERROR' }] });
        component.pixToast.sendErrorNotification = sinon.spy();

        // when
        await component.archiveCampaigns(files);

        // then
        assert.ok(
          component.pixToast.sendErrorNotification.calledOnceWith({
            message: 'Une erreur est survenue. OUPS...',
          }),
        );
      });
    });
  });
});
