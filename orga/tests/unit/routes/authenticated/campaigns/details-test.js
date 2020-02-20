import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/campaigns/details', function(hooks) {
  setupTest(hooks);

  let route, params;
  let findRecordStub;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/campaigns/details');
    params = { campaign_id: 'liste' };

    findRecordStub = sinon.stub();
    const storeStub = Service.create({
      findRecord: findRecordStub
    });
    route.set('store', storeStub);
  });

  test('should redirect to not-found page', async function(assert) {
    // given
    findRecordStub.rejects({ errors: [{ status: '400' }] });

    // then
    const expectedRedirection = 'not-found';
    route.replaceWith = (redirection) => {
      assert.equal(
        redirection,
        expectedRedirection,
        `expect transition to ${expectedRedirection}, got ${redirection}`
      );
    };

    // when
    await route.model(params);
  });
});
