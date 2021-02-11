import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | assessments/:assessment_id/index', function() {
  setupTest();

  it('should redirect to assessments.resume passing through assessmentId', async function() {
    // given
    const route = this.owner.lookup('route:assessments/index');
    route.replaceWith = sinon.stub().resolves();
    const params = { assessment_id: '123' };

    // when
    await route.beforeModel(params);

    // then
    sinon.assert.calledWith(route.replaceWith, 'assessments.resume', '123');
  });
});
