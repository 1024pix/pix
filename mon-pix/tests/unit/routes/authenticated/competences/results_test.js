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
    let belongsToStub;

    hooks.beforeEach(function () {
      findAllStub = sinon.stub();
      storeStub = Service.create({
        findAll: findAllStub,
      });
      sessionStub = Service.create({
        isAuthenticated: true,
      });

      route = this.owner.lookup('route:authenticated/competences.results');
      route.set('store', storeStub);
      route.set('session', sessionStub);
      route.router = { transitionTo: sinon.stub() };
    });

    test('should return the most recent competence-evaluation for a given assessment', async function (assert) {
      // Given
      const tutorial = {
        id: 1,
      };
      const scorecard = {
        id: 1,
        hasMany: sinon.stub(),
      };
      scorecard.hasMany.returns({ reload: sinon.stub().resolves([tutorial]) });
      belongsToStub = sinon.stub().returns({ reload: sinon.stub().resolves(scorecard) });

      const competenceEvaluationsInStore = A([
        { id: 1, createdAt: new Date('2020-01-01'), assessment: { get: () => assessmentId }, belongsTo: belongsToStub },
        { id: 2, createdAt: new Date('2020-02-01'), assessment: { get: () => assessmentId }, belongsTo: belongsToStub },
        { id: 3, createdAt: new Date('2020-03-01'), assessment: { get: () => 456 }, belongsTo: belongsToStub },
      ]);

      findAllStub
        .withArgs('competenceEvaluation', { reload: true, adapterOptions: { assessmentId } })
        .resolves(competenceEvaluationsInStore);

      // When
      const model = await route.model({
        assessment_id: assessmentId,
      });

      // Then
      assert.strictEqual(model.competenceEvaluation.id, 2);
      assert.strictEqual(model.scorecard.id, 1);
    });
  });
});
