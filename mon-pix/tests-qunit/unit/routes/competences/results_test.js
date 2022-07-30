import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { A } from '@ember/array';

module('Unit | Route | Competences | Results', function (hooks) {
  setupTest(hooks);

  module('model', function (hooks) {
    const assessmentId = 'assessmentId';

    let route;
    let storeStub;
    let sessionStub;
    let findAllStub;

    hooks.beforeEach(function () {
      findAllStub = sinon.stub();
      storeStub = Service.create({
        findAll: findAllStub,
      });
      sessionStub = Service.create({
        isAuthenticated: true,
      });

      route = this.owner.lookup('route:competences.results');
      route.set('store', storeStub);
      route.set('session', sessionStub);
      route.router = { transitionTo: sinon.stub() };
    });

    test('should return the most recent competence-evaluation for a given assessment', async function (assert) {
      // Given
      const competenceEvaluationsInStore = A([
        { id: 1, createdAt: new Date('2020-01-01'), assessment: { get: () => assessmentId } },
        { id: 2, createdAt: new Date('2020-02-01'), assessment: { get: () => assessmentId } },
        { id: 3, createdAt: new Date('2020-03-01'), assessment: { get: () => 456 } },
      ]);
      findAllStub
        .withArgs('competenceEvaluation', { reload: true, adapterOptions: { assessmentId } })
        .resolves(competenceEvaluationsInStore);

      // When
      const model = await route.model({
        assessment_id: assessmentId,
      });

      // Then
      assert.equal(model.id, 2);
    });
  });
});
