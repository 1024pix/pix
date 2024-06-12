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
    model = EmberObject.create({
      id: Symbol('an id'),
      certifications: [{}, {}],
      session: { isPublished: null },
      juryCertificationSummaries: {},
    });
  });

  module('#canPublish', function () {
    module('when there is a certification in error and uncancelled', function () {
      test('should not publish the session', async function (assert) {
        // given
        controller.set('model', model);
        controller.model.session.isFinalized = true;
        controller.model.juryCertificationSummaries = [
          { status: 'validated' },
          { status: 'error', isCancelled: false },
        ];

        // when
        const result = controller.canPublish;

        // then
        assert.false(result);
      });
    });

    module('when there is a certification in error and cancelled', function () {
      test('should publish the session', async function (assert) {
        // given
        controller.set('model', model);
        controller.model.session.isFinalized = true;
        controller.model.juryCertificationSummaries = [{ status: 'validated' }, { status: 'error', isCancelled: true }];
        // when
        const result = controller.canPublish;

        // then
        assert.true(result);
      });
    });

    module('when the session is not finalized', function () {
      test('should not publish the session', async function (assert) {
        // given
        controller.set('model', model);
        controller.model.session.isFinalized = false;
        controller.model.juryCertificationSummaries = [{ status: 'started' }];

        // when
        const result = controller.canPublish;

        // then
        assert.false(result);
      });
    });

    module('when there is no certification in error or started', function () {
      test('should publish the session', async function (assert) {
        // given
        controller.set('model', model);
        controller.model.session.isFinalized = true;
        controller.model.juryCertificationSummaries = [{ status: 'validated' }, { status: 'rejected' }];

        // when
        const result = controller.canPublish;

        // then
        assert.true(result);
      });
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
        model.session.isPublished = false;
        model.session.isFinalized = true;
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
        model.session.isPublished = true;
        model.session.isFinalized = true;
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
      controller.model.session.save = sinon.stub();
      isPublishedGetterStub = sinon.stub();
      sinon.stub(controller.model.session, 'isPublished').get(isPublishedGetterStub);
      controller.model.juryCertificationSummaries = { reload: sinon.stub() };
    });

    test('should notify an error if request failed', async function (assert) {
      // given
      const anError = 'anError';
      Object.assign(notificationsStub, { error: sinon.stub() });

      controller.model.session.save = sinon.stub().throws(anError);

      // when
      await controller.actions.toggleSessionPublication.call(controller);
      store.findRecord.resolves(model);

      // then
      assert.throws(model.session.save, anError);
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
        sinon.assert.calledWith(controller.model.session.save, {
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
        sinon.assert.calledWith(model.session.save, {
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
