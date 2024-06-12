import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Certification | Start', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    module('when session is V3 and toggle is enabled', function () {
      module('when hasSeenCertificationInstructions is false', function () {
        test('should redirect to certification information page', async function (assert) {
          // given
          const certificationCandidateId = 'certification-candidate-id';
          const params = { certification_candidate_id: certificationCandidateId };
          const store = this.owner.lookup('service:store');

          const certificationCandidateSubscription = store.createRecord('certification-candidate-subscription', {
            id: certificationCandidateId,
            sessionId: 1234,
            sessionVersion: 3,
          });
          const featureToggles = Object.create({
            featureToggles: {
              areV3InfoScreensEnabled: true,
            },
          });

          const findRecordStub = sinon.stub().returns(certificationCandidateSubscription);
          const storeStub = Service.create({ findRecord: findRecordStub });

          const route = this.owner.lookup('route:authenticated/certifications.start');
          route.set('store', storeStub);
          route.set('featureToggles', featureToggles);
          route.router = { replaceWith: sinon.stub() };
          route.hasSeenCertificationInstructions = false;

          // when
          await route.model(params);

          // then
          sinon.assert.calledWithExactly(
            route.router.replaceWith,
            'authenticated.certifications.information',
            certificationCandidateId,
          );
          assert.ok(true);
        });
      });

      module('when hasSeenCertificationInstructions is true', function () {
        test('should not redirect to certification information page', async function (assert) {
          // given
          const certificationCandidateId = 'certification-candidate-id';
          const params = { certification_candidate_id: certificationCandidateId };
          const store = this.owner.lookup('service:store');

          const certificationCandidateSubscription = store.createRecord('certification-candidate-subscription', {
            id: certificationCandidateId,
            sessionId: 1234,
            sessionVersion: 3,
          });
          const featureToggles = Object.create({
            featureToggles: {
              areV3InfoScreensEnabled: true,
            },
          });

          const findRecordStub = sinon.stub().returns(certificationCandidateSubscription);
          const storeStub = Service.create({ findRecord: findRecordStub });

          const route = this.owner.lookup('route:authenticated/certifications.start');
          route.set('store', storeStub);
          route.set('featureToggles', featureToggles);
          route.router = { replaceWith: sinon.stub() };
          route.hasSeenCertificationInstructions = true;

          // when
          await route.model(params);

          // then
          sinon.assert.notCalled(route.router.replaceWith);
          assert.ok(true);
        });
      });
    });

    module('when session is V3 and toggle is not enabled', function () {
      test('should not redirect to certification information page', async function (assert) {
        // given
        const certificationCandidateId = 'certification-candidate-id';
        const params = { certification_candidate_id: certificationCandidateId };
        const store = this.owner.lookup('service:store');

        const certificationCandidateSubscription = store.createRecord('certification-candidate-subscription', {
          id: certificationCandidateId,
          sessionId: 1234,
          sessionVersion: 3,
        });
        const featureToggles = Object.create({
          featureToggles: {
            areV3InfoScreensEnabled: false,
          },
        });

        const findRecordStub = sinon.stub().returns(certificationCandidateSubscription);
        const storeStub = Service.create({ findRecord: findRecordStub });

        const route = this.owner.lookup('route:authenticated/certifications.start');
        route.set('store', storeStub);
        route.set('featureToggles', featureToggles);
        route.router = { replaceWith: sinon.stub() };

        // when
        const model = await route.model(params);

        // then
        sinon.assert.notCalled(route.router.replaceWith);
        assert.strictEqual(model, certificationCandidateSubscription);
      });
    });

    module('when session is not V3 and toggle is enabled', function () {
      test('should not redirect to certification information page', async function (assert) {
        // given
        const certificationCandidateId = 'certification-candidate-id';
        const params = { certification_candidate_id: certificationCandidateId };
        const store = this.owner.lookup('service:store');

        const certificationCandidateSubscription = store.createRecord('certification-candidate-subscription', {
          id: certificationCandidateId,
          sessionId: 1234,
          sessionVersion: 2,
        });
        const featureToggles = Object.create({
          featureToggles: {
            areV3InfoScreensEnabled: true,
          },
        });

        const findRecordStub = sinon.stub().returns(certificationCandidateSubscription);
        const storeStub = Service.create({ findRecord: findRecordStub });

        const route = this.owner.lookup('route:authenticated/certifications.start');
        route.set('store', storeStub);
        route.set('featureToggles', featureToggles);
        route.router = { replaceWith: sinon.stub() };

        // when
        const model = await route.model(params);

        // then
        sinon.assert.notCalled(route.router.replaceWith);
        assert.strictEqual(model, certificationCandidateSubscription);
      });
    });

    module('when session is not V3 and toggle is not enabled', function () {
      test('should not redirect to certification information page', async function (assert) {
        // given
        const certificationCandidateId = 'certification-candidate-id';
        const params = { certification_candidate_id: certificationCandidateId };
        const store = this.owner.lookup('service:store');

        const certificationCandidateSubscription = store.createRecord('certification-candidate-subscription', {
          id: certificationCandidateId,
          sessionId: 1234,
          sessionVersion: 2,
        });
        const featureToggles = Object.create({
          featureToggles: {
            areV3InfoScreensEnabled: false,
          },
        });

        const findRecordStub = sinon.stub().returns(certificationCandidateSubscription);
        const storeStub = Service.create({ findRecord: findRecordStub });

        const route = this.owner.lookup('route:authenticated/certifications.start');
        route.set('store', storeStub);
        route.set('featureToggles', featureToggles);
        route.router = { replaceWith: sinon.stub() };

        // when
        const model = await route.model(params);

        // then
        sinon.assert.notCalled(route.router.replaceWith);
        assert.strictEqual(model, certificationCandidateSubscription);
      });
    });
  });
});
