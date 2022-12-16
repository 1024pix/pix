import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/new', function (hooks) {
  setupTest(hooks);

  test('should return members', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/new');

    class CurrentUserStub extends Service {
      organization = EmberObject.create({
        id: 12345,
      });
    }
    this.owner.register('service:current-user', CurrentUserStub);

    const members = Symbol('list of members sorted by firstnames and lastnames');
    const findAllStub = sinon.stub();
    const storeStub = {
      findAll: findAllStub.resolves(members),
      createRecord: sinon.stub(),
    };
    route.store = storeStub;

    // when
    const result = await route.model();

    //then
    assert.strictEqual(result.membersSortedByFullName, members);
  });
});
