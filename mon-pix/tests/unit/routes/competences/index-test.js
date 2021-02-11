import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | competences/:competence_id/index', function() {
  setupTest();

  it('should redirect to competences.details', async function() {
    // given
    const route = this.owner.lookup('route:competences/index');
    route.replaceWith = sinon.stub().resolves();
    const params = { competence_id: 'rec123' };

    // when
    await route.beforeModel(params);

    // then
    sinon.assert.calledWith(route.replaceWith, 'competences.details', 'rec123');
  });
});
