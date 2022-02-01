import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/campaign/activity', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/campaign/activity');
  });

  module('#action goToParticipantPage', function () {
    test('it should call transitionToRoute with appropriate arguments for profiles collection', function (assert) {
      // given
      controller.transitionToRoute = sinon.stub();
      controller.model = { campaign: { isTypeAssessment: false } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(controller.transitionToRoute.calledWith('authenticated.campaigns.participant-profile', 123, 456));
    });

    test('it should call transitionToRoute with appropriate arguments for assessment', function (assert) {
      // given
      controller.transitionToRoute = sinon.stub();
      controller.model = { campaign: { isTypeAssessment: true } };

      // when
      controller.send('goToParticipantPage', 123, 456);

      // then
      assert.true(controller.transitionToRoute.calledWith('authenticated.campaigns.participant-assessment', 123, 456));
    });
  });

  module('#action triggerFiltering', function (hooks) {
    hooks.beforeEach(function () {
      controller.model = { campaign: { isTypeAssessment: false } };
    });

    test('it updates all filters', function (assert) {
      // given
      controller.pageNumber = 5;
      controller.divisions = ['A2'];
      controller.status = 'SHARED';
      controller.groups = ['L3'];

      // when
      controller.send('triggerFiltering', { divisions: ['A1'], status: 'STARTED', groups: ['L3'] });

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.pageNumber, null);
      assert.deepEqual(controller.divisions, ['A1']);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(controller.status, 'STARTED');
      assert.deepEqual(controller.groups, ['L3']);
    });

    module('when division filter does not change', function () {
      test('it does not update divisions', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.divisions = ['A2'];
        controller.status = 'SHARED';

        // when
        controller.send('triggerFiltering', { status: 'COMPLETED' });

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageNumber, null);
        assert.deepEqual(controller.divisions, ['A2']);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, 'COMPLETED');
      });
    });

    module('when groups filter does not change', function () {
      test('it does not update groups', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.groups = ['A2'];
        controller.status = 'SHARED';

        // when
        controller.send('triggerFiltering', { status: 'COMPLETED' });

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageNumber, null);
        assert.deepEqual(controller.groups, ['A2']);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, 'COMPLETED');
      });
    });

    module('when status filter does not change', function () {
      test('it does not update status', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.divisions = ['A2'];
        controller.status = 'SHARED';

        // when
        controller.send('triggerFiltering', { divisions: ['A1'] });

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageNumber, null);
        assert.deepEqual(controller.divisions, ['A1']);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, 'SHARED');
      });
    });

    module('when status filter is reseted', function () {
      test('it updates status', function (assert) {
        // given
        controller.pageNumber = 5;
        controller.status = 'SHARED';

        // when
        controller.send('triggerFiltering', { status: '' });

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, '');
      });
    });
  });
});
