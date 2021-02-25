import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/certifications', function(hooks) {
  setupTest(hooks);

  module('#onSelectDivision', function() {

    test('should change the value of the selected division', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };

      controller.selectedDivision = '3èmeA';

      const event = {
        target: {
          value: '2ndB',
        },
      };

      // when
      await controller.onSelectDivision(event);

      // then
      assert.equal(controller.selectedDivision, event.target.value);
    });
  });

  module('#downloadSessionResultFile', function() {

    test('should call the file-saver service with the right parametters', async function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      const token = 'a token';
      const organizationId = 12345;
      const selectedDivision = '3èmeA';

      controller.selectedDivision = selectedDivision;

      controller.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };

      controller.currentUser = {
        organization: {
          id: organizationId,
        },
      };

      controller.fileSaver = {
        save: sinon.stub(),
      };

      // when
      await controller.downloadSessionResultFile();

      // then
      assert.ok(controller.fileSaver.save.calledWith(
        {
          token,
          url: `/api/organizations/${organizationId}/certification-results?division=${selectedDivision}`,
        },
      ));
    });
  });
});
