import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sup-students/list', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/sup-students/list');
    controller.refresh = () => {};
  });

  module('#importStudents', function() {
    test('it sends the chosen file to the API', async function(assert) {
      const session = { data: { authenticated: { access_token: 12345 } } };

      const importStudentsURL = `${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/schooling-registrations/import-csv`;
      const headers = { Authorization: `Bearer ${12345}` };
      const file = { uploadBinary: sinon.spy() };

      controller.session = session;
      await controller.importStudents(file);

      assert.ok(file.uploadBinary.calledWith(importStudentsURL, { headers }));
    });
  });
});
