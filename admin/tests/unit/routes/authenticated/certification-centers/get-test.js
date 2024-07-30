import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-centers/get', function (hooks) {
  setupTest(hooks);

  test('it should return certification center and habilitations', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/certification-centers/get');
    const store = this.owner.lookup('service:store');

    const certificationCenter = Symbol('the certification center');
    const habilitations = Symbol('some habilitations');
    store.findRecord = sinon.stub();
    store.findRecord.withArgs('certification-center', 777).resolves(certificationCenter);
    store.findAll = sinon.stub();
    store.findAll.withArgs('complementary-certification').resolves(habilitations);

    // when
    const result = await route.model({ certification_center_id: 777 });

    // then
    assert.strictEqual(result.certificationCenter, certificationCenter);
    assert.strictEqual(result.habilitations, habilitations);
  });
});
