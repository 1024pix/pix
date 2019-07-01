import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | competence-evaluation', function() {
  setupTest();

  describe('#queryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.owner.lookup('adapter:competence-evaluation');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build /startOrResume url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ startOrResume: true }, 'competenceEvaluation');

      // then
      expect(url).to.equal('http://localhost:3000/api/competence-evaluations/start-or-resume');
    });

    it('should build classic url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({}, 'competenceEvaluation');

      // then
      expect(url).to.equal('http://localhost:3000/api/competence-evaluations');
    });

  });

});
