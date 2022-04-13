import { module, test } from 'qunit';
import sinon from 'sinon';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/certifications', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#get hasDivisions', function () {
    test('should return true when organization has divisions', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };

      // when
      const hasDivisions = controller.hasDivisions;

      // then
      assert.true(hasDivisions);
    });

    test("should return false when organization doesn't have divisions", async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      controller.model = {
        options: [],
      };

      // when
      const hasDivisions = controller.hasDivisions;

      // then
      assert.false(hasDivisions);
    });
  });

  module('#onSelectDivision', function () {
    test('should change the value of the selected division', async function (assert) {
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.selectedDivision, event.target.value);
    });
  });

  module('#downloadSessionResultFile', function () {
    test('should call the file-saver service with the right parameters', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      const token = 'a token';
      const organizationId = 12345;
      const selectedDivision = '3èmea';

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

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.downloadSessionResultFile(event);

      // then
      assert.ok(
        controller.fileSaver.save.calledWith({
          token,
          url: `/api/organizations/${organizationId}/certification-results?division=${selectedDivision}`,
        })
      );
    });

    test('it should not call file-save service and display an error if division is invalid', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');
      controller.selectedDivision = 'Banana bread';
      controller.fileSaver = {
        save: sinon.stub(),
      };
      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };
      class NotificationsStub extends Service {
        error = errorMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const errorMock = sinon.stub();
      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.downloadSessionResultFile(event);

      // then
      sinon.assert.notCalled(controller.fileSaver.save);
      sinon.assert.calledWith(
        errorMock,
        this.intl.t('pages.certifications.errors.invalid-division', { selectedDivision: 'Banana bread' }),
        { autoClear: false }
      );
      assert.ok(true);
    });
  });

  module('#downloadAttestation', function () {
    test('should call the file-saver service for downloadAttestation with the right parameters', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');

      const token = 'a token';
      const fileName = 'attestations_pix.pdf';
      const organizationId = 12345;
      const selectedDivision = '3èmea';

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

      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.downloadAttestation(event);

      // then
      assert.ok(
        controller.fileSaver.save.calledWith({
          token,
          fileName,
          url: `/api/organizations/${organizationId}/certification-attestations?division=${selectedDivision}`,
        })
      );
    });

    test('it should not call fileSaver for downloadAttestation service and display an error if division is invalid', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications');
      controller.selectedDivision = 'Americaine';
      controller.fileSaver = {
        save: sinon.stub(),
      };
      controller.model = {
        options: [{ label: '3èmeA', value: '3èmeA' }],
      };
      class NotificationsStub extends Service {
        error = errorMock;
      }
      this.owner.register('service:notifications', NotificationsStub);
      const errorMock = sinon.stub();
      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await controller.downloadAttestation(event);

      // then
      sinon.assert.notCalled(controller.fileSaver.save);
      sinon.assert.calledWith(
        errorMock,
        this.intl.t('pages.certifications.errors.invalid-division', { selectedDivision: 'Americaine' }),
        { autoClear: false }
      );
      assert.ok(true);
    });
  });
});
