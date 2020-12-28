import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | competence-evaluation', function() {
  setupTest();

  describe('#urlForFindAll', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.owner.lookup('adapter:competence-evaluation');
    });

    it('should build url for fetching competence-evaluations based on assessment route', async function() {
      // when
      const assessmentId = 123;
      const url = await adapter.urlForFindAll('competenceEvaluation', { adapterOptions: { assessmentId } });

      // then
      expect(url.endsWith(`/assessments/${assessmentId}/competence-evaluations`)).to.be.true;
    });

  });

  describe('#urlQueryForRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.owner.lookup('adapter:competence-evaluation');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build /startOrResume url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ startOrResume: true }, 'competenceEvaluation');

      // then
      expect(url.endsWith('/competence-evaluations/start-or-resume')).to.be.true;
    });

    it('should build classic url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({}, 'competenceEvaluation');

      // then
      expect(url.endsWith('/competence-evaluations')).to.be.true;
    });

    it('should build /improve url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ improve: true }, 'competenceEvaluation');

      // then
      expect(url.endsWith('/competence-evaluations/improve')).to.be.true;
    });

  });

});
