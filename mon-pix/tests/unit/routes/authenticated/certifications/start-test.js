import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Certification | Start', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    module('when hasSeenCertificationInstructions is false', function () {
      test('should redirect to certification information page', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCandidate = store.createRecord('certification-candidate', {
          sessionId: 1234,
          hasSeenCertificationInstructions: false,
        });
        const params = { certification_candidate_id: certificationCandidate.id };

        const findRecordStub = sinon.stub().returns(certificationCandidate);
        const storeStub = Service.create({ findRecord: findRecordStub });

        const route = this.owner.lookup('route:authenticated/certifications.start');
        route.set('store', storeStub);
        route.router = { replaceWith: sinon.stub() };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWithExactly(
          route.router.replaceWith,
          'authenticated.certifications.information',
          certificationCandidate.id,
        );
        assert.ok(true);
      });
    });

    module('when hasSeenCertificationInstructions is true', function () {
      test('should not redirect to certification information page', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationCandidate = store.createRecord('certification-candidate', {
          sessionId: 1234,
          hasSeenCertificationInstructions: true,
        });
        const params = { certification_candidate_id: certificationCandidate.id };

        const findRecordStub = sinon.stub().returns(certificationCandidate);
        const storeStub = Service.create({ findRecord: findRecordStub });

        const route = this.owner.lookup('route:authenticated/certifications.start');
        route.set('store', storeStub);
        route.router = { replaceWith: sinon.stub() };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(route.router.replaceWith);
        assert.ok(true);
      });
    });
  });
});
