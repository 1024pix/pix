import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | modules | passage', function (hooks) {
  setupTest(hooks);

  let clock;
  const now = new Date('2019-05-07');

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers(now);
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('should exist', function (assert) {
    // when
    const route = this.owner.lookup('route:module.passage');

    // then
    assert.ok(route);
  });

  test('should find the corresponding module', async function (assert) {
    // given
    const route = this.owner.lookup('route:module.passage');
    const store = this.owner.lookup('service:store');
    const module = Symbol('the module');
    route.modelFor = sinon.stub();
    route.modelFor.withArgs('module').returns(module);

    store.createRecord = sinon.stub();
    const passage = { id: 2048 };
    store.createRecord.returns({ save: () => passage });

    // when
    const model = await route.model({ slug: 'the-module' });

    // then
    assert.strictEqual(model.module, module);
  });

  test('should create and return a new passage and initialize event service', async function (assert) {
    // given
    const passage = { id: 2019 };

    const route = this.owner.lookup('route:module.passage');
    const store = this.owner.lookup('service:store');
    const module = { id: 'module-id', slug: 'module-slug' };

    route.modelFor = sinon.stub();
    route.modelFor.withArgs('module').returns(module);
    store.createRecord = sinon.stub();
    const save = sinon.stub();
    save.resolves(passage);

    store.createRecord.withArgs('passage', { moduleId: 'module-id' }).returns({ save: save });

    const passageEventService = this.owner.lookup('service:passage-events');
    passageEventService.initialize = sinon.stub();

    // when
    const model = await route.model({ slug: 'my-module' });

    // then
    assert.strictEqual(model.passage, passage);
    sinon.assert.calledWith(save, {
      adapterOptions: {
        occurredAt: now.getTime(),
        sequenceNumber: 1,
        moduleVersion: module.version,
      },
    });
    sinon.assert.calledWith(passageEventService.initialize, {
      passageId: 2019,
    });
  });

  module('#afterModel', function () {
    test('should call computeCurrentSectionByGrainIndex when grainIndex is present in query params', function (assert) {
      // given
      const route = this.owner.lookup('route:module.passage');
      const modulixNavigationProgress = this.owner.lookup('service:modulix-navigation-progress');
      modulixNavigationProgress.computeCurrentSectionByGrainIndex = sinon.stub();

      const module = { id: 'module-id' };
      const transition = { to: { queryParams: { grainIndex: '3' } } };

      // when
      route.afterModel({ module }, transition);

      // then
      sinon.assert.calledOnceWithExactly(modulixNavigationProgress.computeCurrentSectionByGrainIndex, module, 3);
      assert.ok(true);
    });

    test('should not call computeCurrentSectionByGrainIndex when grainIndex is absent from query params', function (assert) {
      // given
      const route = this.owner.lookup('route:module.passage');
      const modulixNavigationProgress = this.owner.lookup('service:modulix-navigation-progress');
      modulixNavigationProgress.computeCurrentSectionByGrainIndex = sinon.stub();

      const module = { id: 'module-id' };
      const transition = { to: { queryParams: {} } };

      // when
      route.afterModel({ module }, transition);

      // then
      sinon.assert.notCalled(modulixNavigationProgress.computeCurrentSectionByGrainIndex);
      assert.ok(true);
    });
  });

  module('#redirect', function () {
    test('should call transitionTo function with the right arguments', async function (assert) {
      // given
      const module = {
        shortId: 'shortId',
        slug: 'slug',
      };
      const model = {
        module,
      };
      const router = this.owner.lookup('service:router');
      const transitionToStub = sinon.stub(router, 'transitionTo');

      const route = this.owner.lookup('route:module.passage');

      // when
      route.redirect(model);

      // then
      sinon.assert.calledOnceWithExactly(transitionToStub, 'module.passage', module.shortId, module.slug);
      assert.ok(true);
    });
  });
});
