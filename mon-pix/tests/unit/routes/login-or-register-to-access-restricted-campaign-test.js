import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | login-or-register-to-access-restricted-campaign', () => {

  setupTest();

  let route;
  let storeStub;
  let queryStub;

  beforeEach(function() {
    queryStub = sinon.stub();
    storeStub = Service.create({
      query: queryStub
    });

    route = this.owner.lookup('route:login-or-register-to-access-restricted-campaign');
    route.set('store', storeStub);
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

  it('should retrieve a campain by his code', async function() {
    // given
    const expectedCampains = [{ id: 1 }];
    queryStub.resolves(expectedCampains);

    const expectedCode = 'RESTRICTD';
    const params = { campaign_code: expectedCode };

    // when
    const model = await route.model(params);

    // then
    sinon.assert.calledWith(queryStub, 'campaign', { filter: { code: expectedCode } });
    expect(model.id).to.equal(1);
  });

});
