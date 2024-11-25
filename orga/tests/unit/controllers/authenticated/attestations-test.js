import Service from '@ember/service';
import {
  SIXTH_GRADE_ATTESTATION_FILE_NAME,
  SIXTH_GRADE_ATTESTATION_KEY,
} from 'pix-orga/controllers/authenticated/attestations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/attestations', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#downloadSixthGradeAttestationsFile', function () {
    test('should call the file-saver service with the right parameters', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/attestations');

      const token = 'a token';
      const organizationId = 12345;
      const selectedDivision = ['3èmea'];

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

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };

      // when
      await controller.downloadSixthGradeAttestationsFile(selectedDivision);

      // then
      assert.ok(
        controller.fileSaver.save.calledWith({
          token,
          url: `/api/organizations/${organizationId}/attestations/${SIXTH_GRADE_ATTESTATION_KEY}?divisions[]=${encodeURIComponent(selectedDivision)}`,
          fileName: SIXTH_GRADE_ATTESTATION_FILE_NAME,
        }),
      );
    });

    test('it should not call file-save service and display an error if an error occurs', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/attestations');
      const selectedDivision = ['3emeA'];
      const organizationId = 123;
      const errorMessage = 'oops';

      controller.currentUser = {
        organization: {
          id: organizationId,
        },
      };
      controller.fileSaver = {
        save: sinon.stub(),
      };
      controller.fileSaver.save.rejects(new Error(errorMessage));

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };
      class NotificationsStub extends Service {
        sendError = errorMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const errorMock = sinon.stub();

      // when
      await controller.downloadSixthGradeAttestationsFile(selectedDivision);

      // then
      sinon.assert.calledWith(errorMock, errorMessage, { autoClear: false });
      assert.ok(true);
    });
  });
});
