import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sessions/session/certifications', function (hooks) {
  setupTest(hooks);
  let controller;
  let model;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sessions/session/certifications');
    model = EmberObject.create({ id: Symbol('an id'), certifications: [{}, {}], isPublished: null });
  });

  module('#canPublish', function () {
    test('should be false when there is a certification in error', async function (assert) {
      // given
      controller.set('model', model);
      controller.model.juryCertificationSummaries = [{ status: 'validated' }, { status: 'error' }];

      // when
      const result = controller.canPublish;

      // then
      assert.false(result);
    });

    test('should be false when there is a certification started', async function (assert) {
      // given
      controller.set('model', model);
      controller.model.juryCertificationSummaries = [{ status: 'rejected' }, { status: 'started' }];

      // when
      const result = controller.canPublish;

      // then
      assert.false(result);
    });

    test('should be true when there is no certification in error orstarted', async function (assert) {
      // given
      controller.set('model', model);
      controller.model.juryCertificationSummaries = [{ status: 'rejected' }, { status: 'validated' }];

      // when
      const result = controller.canPublish;

      // then
      assert.true(result);
    });
  });

  module('#displayCertificationStatusUpdateConfirmationModal', function (hooks) {
    hooks.beforeEach(function () {
      controller.set('model', model);
    });

    module('when session is not yet published', function () {
      test('should update modal message to publish', async function (assert) {
        // given
        model.canPublish = true;
        model.isPublished = false;
        model.juryCertificationSummaries = [{ status: 'validated' }];

        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller);

        // then
        assert.strictEqual(controller.confirmMessage, 'Souhaitez-vous publier la session ?');
        assert.true(controller.displayConfirm);
      });
    });

    module('when session is published', function () {
      test('should update modal message to unpublish', async function (assert) {
        // given
        model.isPublished = true;
        model.juryCertificationSummaries = [{ status: 'validated' }];

        // when
        await controller.actions.displayCertificationStatusUpdateConfirmationModal.call(controller);

        // then
        assert.strictEqual(controller.confirmMessage, 'Souhaitez-vous dépublier la session ?');
        assert.true(controller.displayConfirm);
      });
    });
  });

  module('#toggleSessionPublication', function (hooks) {
    let notificationsStub;
    let store;
    let isPublishedGetterStub;

    hooks.beforeEach(function () {
      notificationsStub = { success: sinon.stub() };
      store = this.owner.lookup('service:store');

      store.findRecord = sinon.stub();
      controller.set('model', model);
      controller.set('notifications', notificationsStub);
      controller.set('displayConfirm', true);
      controller.model.save = sinon.stub();
      isPublishedGetterStub = sinon.stub();
      sinon.stub(controller.model, 'isPublished').get(isPublishedGetterStub);
      controller.model.juryCertificationSummaries = { reload: sinon.stub() };
    });

    test('should notify an error if request failed', async function (assert) {
      // given
      const anError = 'anError';
      Object.assign(notificationsStub, { error: sinon.stub() });

      controller.model.save = sinon.stub().throws(anError);

      // when
      await controller.actions.toggleSessionPublication.call(controller);
      store.findRecord.resolves(model);

      // then
      assert.throws(model.save, anError);
      sinon.assert.called(notificationsStub.error);
      assert.false(controller.displayConfirm);
    });

    module('when session is not yet published', function () {
      test('should publish all certifications', async function (assert) {
        // given
        isPublishedGetterStub.onCall(0).returns(false);
        isPublishedGetterStub.onCall(1).returns(true);

        // when
        await controller.actions.toggleSessionPublication.call(controller);

        // then
        sinon.assert.calledWith(controller.model.save, {
          adapterOptions: { updatePublishedCertifications: true, toPublish: true },
        });
        sinon.assert.calledWith(notificationsStub.success, 'Les certifications ont été correctement publiées.');
        assert.false(controller.displayConfirm);
      });
    });

    module('when session is published', function () {
      test('should unpublish all certifications', async function (assert) {
        // given
        isPublishedGetterStub.onCall(0).returns(true);
        isPublishedGetterStub.onCall(1).returns(false);

        // when
        await controller.actions.toggleSessionPublication.call(controller);

        // then
        sinon.assert.calledWith(model.save, {
          adapterOptions: { updatePublishedCertifications: true, toPublish: false },
        });
        sinon.assert.calledWith(notificationsStub.success, 'Les certifications ont été correctement dépubliées.');
        assert.false(controller.displayConfirm);
      });
    });
  });

  module('get sortedCertificationJurySummaries', function () {
    test('should return jury certification summaries sorted by numberOfCertificationIssueReportsWithRequiredAction in descending order', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const firstJuryCertificationSummary = store.createRecord('jury-certification-summary', {
        numberOfCertificationIssueReportsWithRequiredAction: 0,
      });
      const secondJuryCertificationSummary = store.createRecord('jury-certification-summary', {
        numberOfCertificationIssueReportsWithRequiredAction: 3,
      });
      const thirdJuryCertificationSummary = store.createRecord('jury-certification-summary', {
        numberOfCertificationIssueReportsWithRequiredAction: 1,
      });
      controller.set('model', {
        juryCertificationSummaries: [
          firstJuryCertificationSummary,
          secondJuryCertificationSummary,
          thirdJuryCertificationSummary,
        ],
      });

      // when
      const sortedCertificationJurySummaries = controller.sortedCertificationJurySummaries;

      // then
      assert.deepEqual(sortedCertificationJurySummaries, [
        secondJuryCertificationSummary,
        thirdJuryCertificationSummary,
        firstJuryCertificationSummary,
      ]);
    });
  });
});
