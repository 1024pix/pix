import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/new', function (hooks) {
  setupTest(hooks);

  test('should return members list sorted by full name', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/new');

    class CurrentUserStub extends Service {
      organization = EmberObject.create({
        id: 12345,
      });
    }
    this.owner.register('service:current-user', CurrentUserStub);

    const membership1 = EmberObject.create({
      user: EmberObject.create({
        firstName: 'Alice',
        lastName: 'Delamer',
      }),
    });
    const membership2 = EmberObject.create({
      user: EmberObject.create({
        firstName: 'Alice',
        lastName: 'Delamare',
      }),
    });
    const queryStub = sinon.stub();
    const storeStub = {
      query: queryStub.resolves([membership1, membership2]),
      createRecord: sinon.stub(),
    };
    route.store = storeStub;

    const params = {
      pageNumber: 1,
      pageSize: 2,
    };

    // when
    const result = await route.model(params);

    //then
    assert.strictEqual(result.membersSortedByFullName[0].lastName, 'Delamare');
    assert.strictEqual(result.membersSortedByFullName[1].lastName, 'Delamer');
  });
});
