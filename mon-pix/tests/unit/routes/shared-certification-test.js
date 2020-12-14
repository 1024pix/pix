// import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | shared-certification', function() {
  setupTest();

  it('should redirect if there a no data (direct access)', function() {
    const route = this.owner.lookup('route:shared-certification');
    sinon.stub(route, 'replaceWith');

    route.redirect({}, {});
    sinon.assert.calledWithExactly(route.replaceWith, '/verification-certificat?unallowedAccess=true');
  });

  it('should not redirect with certification', function() {
    const route = this.owner.lookup('route:shared-certification');
    sinon.stub(route, 'replaceWith');

    route.redirect({ data: {} }, {});
    sinon.assert.notCalled(route.replaceWith);
  });
});
