import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | error-response-handler', function (hooks) {
  setupTest(hooks);

  test('it notifies a non-JSONAPI error as a single notification', function (assert) {
    // given
    const service = this.owner.lookup('service:error-response-handler');
    const errorMock = sinon.stub();
    service.notifications = {
      error: errorMock,
    };
    const errorResponse = new Error('a generic error');

    // when
    service.notify(errorResponse);

    // then
    assert.ok(errorMock.calledWith(errorResponse));
  });

  module('Without custom error messages', function () {
    test('it notifies JSONAPI bundled errors as several notifications with error default messages', function (assert) {
      // given
      const service = this.owner.lookup('service:error-response-handler');
      const errorMock = sinon.stub();
      service.notifications = {
        error: errorMock,
      };
      const errorResponse = {
        errors: [
          {
            status: '422',
            title: 'Something went wrong',
            detail: 'the provided id is invalid',
          },
          {
            status: '404',
            title: 'Something else went wrong too !',
          },
          {
            title: 'Something went wrong',
            detail: 'the provided id is invalid',
          },
        ],
      };

      // when
      service.notify(errorResponse);

      // then
      sinon.assert.calledWith(errorMock, 'Cette opération est impossible.');
      sinon.assert.calledWith(errorMock, 'Non trouvé.');
      sinon.assert.calledWith(errorMock, 'Une erreur est survenue.');
      assert.ok(true);
    });
  });

  module('With custom error messages', function () {
    test('it notifies JSONAPI bundled errors as several notifications with custom messages', function (assert) {
      // given
      const service = this.owner.lookup('service:error-response-handler');
      const errorMock = sinon.stub();
      service.notifications = {
        error: errorMock,
      };
      const errorResponse = {
        errors: [
          {
            status: '422',
            title: 'Something went wrong',
            detail: 'the provided id is invalid',
          },
          {
            status: '404',
            title: 'Something else went wrong too !',
          },
          {
            status: ' 666',
            title: 'Unknown error',
          },
        ],
      };

      const customErrorMessagesByStatus = {
        DEFAULT: 'Une problème est survenu, veuillez ressayez.',
        STATUS_422: 'Opération impossible.',
        STATUS_404: 'Information non trouvée.',
      };

      // when
      service.notify(errorResponse, customErrorMessagesByStatus);

      // then
      sinon.assert.calledWith(errorMock, customErrorMessagesByStatus.DEFAULT);
      sinon.assert.calledWith(errorMock, customErrorMessagesByStatus.STATUS_422);
      sinon.assert.calledWith(errorMock, customErrorMessagesByStatus.STATUS_404);
      assert.ok(true);
    });
  });
});
