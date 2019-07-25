import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Competence', function() {
  setupTest();

  const competenceId = 'competenceId';

  let route;
  let storeStub;
  let queryRecordStub;
  let competenceEvaluation;

  beforeEach(function() {
    competenceEvaluation = EmberObject.create({ id: 123, competenceId });

    queryRecordStub = sinon.stub().resolves(competenceEvaluation);
    storeStub = Service.extend({
      queryRecord: queryRecordStub
    });

    this.owner.register('service:store', storeStub);

    route = this.owner.lookup('route:competence');
  });

  describe('#model', function() {

    it('should returns the competenceEvaluation', async function() {
      // given
      const params = { competence_id: competenceId };

      // when
      const model = await route.model(params);

      // then
      expect(model).to.equal(competenceEvaluation);
      sinon.assert.calledWith(queryRecordStub, 'competenceEvaluation', {
        competenceId, startOrResume: true
      });
    });

  });
});
