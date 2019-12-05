import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competence | Resume', function() {
  setupTest();

  let route;
  const competenceId = 'competenceId';
  let storeStub;
  let queryRecordStub;
  let competenceEvaluation;

  beforeEach(function() {

    competenceEvaluation = EmberObject.create({ id: 123, competenceId });

    queryRecordStub = sinon.stub().resolves(competenceEvaluation);
    storeStub = Service.create({
      queryRecord: queryRecordStub
    });

    route = this.owner.lookup('route:competences.resume');
    route.set('store', storeStub);
    route.replaceWith = sinon.stub();
  });

  describe('#model', function() {

    it('should returns the competenceEvaluation', async function() {
      // given
      const transition = { to: { parent: { params: { competence_id: competenceId } } } };

      // when
      const model = await route.model(null, transition);

      // then
      expect(model).to.equal(competenceEvaluation);
    });

  });

  describe('#afterModel', function() {

    it('should transition to assessments.resume', function() {
      // given
      route.replaceWith.resolves();
      const competenceEvaluation = EmberObject.create({ competenceId, assessment: { id: 'assessmentId' } });

      // when
      const promise = route.afterModel(competenceEvaluation);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.replaceWith);
        sinon.assert.calledWith(route.replaceWith, 'assessments.resume', 'assessmentId');
      });
    });
  });
});
