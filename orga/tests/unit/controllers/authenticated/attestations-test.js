import Service from '@ember/service';
import { EVENT_NAME } from 'pix-orga/constants/metrics-event-name';
import { FILE_NAME, SIXTH_GRADE_ATTESTATION_KEY } from 'pix-orga/controllers/authenticated/attestations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/attestations', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#downloadAttestations', function () {
    module('when there are selected divisions', function () {
      test('should call the file-saver service with the right parameters', async function (assert) {
        // given
        this.intl = this.owner.lookup('service:intl');
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
        await controller.downloadAttestations(SIXTH_GRADE_ATTESTATION_KEY, selectedDivision);

        // then
        assert.ok(
          controller.fileSaver.save.calledWith({
            token,
            url: `/api/organizations/${organizationId}/attestations/${SIXTH_GRADE_ATTESTATION_KEY}?divisions[]=${encodeURIComponent(selectedDivision)}`,
            fileName: FILE_NAME,
            noContentMessageNotification: this.intl.t('pages.attestations.no-attestations'),
          }),
        );
      });
    });

    module('when selected divisions is empty', function () {
      test('should call the file-saver service with the right parameters', async function (assert) {
        // given
        this.intl = this.owner.lookup('service:intl');
        const controller = this.owner.lookup('controller:authenticated/attestations');

        const token = 'a token';
        const organizationId = 12345;
        const selectedDivision = [];

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
          options: [],
        };

        // when
        await controller.downloadAttestations(SIXTH_GRADE_ATTESTATION_KEY, selectedDivision);

        // then
        assert.ok(
          controller.fileSaver.save.calledWith({
            token,
            url: `/api/organizations/${organizationId}/attestations/${SIXTH_GRADE_ATTESTATION_KEY}`,
            fileName: FILE_NAME,
            noContentMessageNotification: this.intl.t('pages.attestations.no-attestations'),
          }),
        );
      });
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
      await controller.downloadAttestations(SIXTH_GRADE_ATTESTATION_KEY, selectedDivision);

      // then
      sinon.assert.calledWith(errorMock, errorMessage, { autoClear: false });
      assert.ok(true);
    });

    test('it should send a download attestation button click event', async function (assert) {
      // given
      const metrics = this.owner.lookup('service:pix-metrics');
      const trackEventStub = sinon.stub(metrics, 'trackEvent');

      this.intl = this.owner.lookup('service:intl');
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
      await controller.downloadAttestations(SIXTH_GRADE_ATTESTATION_KEY, selectedDivision);

      // then
      assert.ok(trackEventStub.calledOnceWithExactly(EVENT_NAME.ATTESTATION.DOWNLOAD_CLICK));
    });
  });
});
