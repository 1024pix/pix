import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/catalogue/list', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('beforeModel', function () {
    ['all', 'targetProfile', 'blueprint'].forEach((type) => {
      test(`it should not redirect if param type=${type}`, async function (assert) {
        // given
        const routerService = this.owner.lookup('service:router');
        sinon.stub(routerService, 'replaceWith');
        const route = this.owner.lookup('route:authenticated/catalogue/list');

        // when
        await route.beforeModel({ to: { params: { type } } });

        //then
        assert.ok(routerService.replaceWith.notCalled);
      });
    });

    test('it should redirect to catalogue list page with type=all if type params is not supported', async function (assert) {
      // given

      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');
      const route = this.owner.lookup('route:authenticated/catalogue/list');

      // when
      await route.beforeModel({ to: { params: null } });

      //then
      assert.ok(routerService.replaceWith.calledOnceWithExactly('authenticated.catalogue.list', 'all'));
    });
  });

  module('model', function () {
    module('courses', function () {
      test('it fetches courses from the API when none are present in the store', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/catalogue/list');
        const store = this.owner.lookup('service:store');
        const currentUser = this.owner.lookup('service:current-user');
        const organizationId = Symbol('organizationId');
        sinon.stub(currentUser, 'organization').value({ id: organizationId });
        const courses = Symbol('Courses');

        sinon.stub(store, 'peekAll').withArgs('course').returns([]);
        sinon
          .stub(store, 'findAll')
          .withArgs('course', { backgroundReload: false, adapterOptions: { organizationId } })
          .resolves(courses);

        // when
        const result = await route.model({ type: 'all' });

        // then
        assert.ok(store.findAll.calledOnce);
        assert.deepEqual(result, { courses, currentCourse: undefined, type: 'all' });
      });
      test('it returns cached courses without calling the API when the store is not empty', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:current-user');
        const organizationId = Symbol('organizationId');
        sinon.stub(currentUser, 'organization').value({ id: organizationId });
        const route = this.owner.lookup('route:authenticated/catalogue/list');
        const store = this.owner.lookup('service:store');
        const courses = [Symbol('Course')];
        sinon.stub(store, 'peekAll').withArgs('course').returns(courses);
        sinon.stub(store, 'findAll');
        sinon.stub(store, 'unloadAll');

        // when
        const result = await route.model({ type: 'all' });
        // then
        assert.ok(store.findAll.notCalled);
        assert.deepEqual(result, { courses, currentCourse: undefined, type: 'all' });
      });
      test('it unload cached courses when organization change', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:current-user');
        const organizationId = Symbol('organizationId');
        sinon.stub(currentUser, 'organization').value({ id: organizationId });
        const route = this.owner.lookup('route:authenticated/catalogue/list');
        const store = this.owner.lookup('service:store');
        const courses = [Symbol('Course')];
        sinon.stub(store, 'peekAll').withArgs('course').returns(courses);
        sinon.stub(store, 'findAll');
        sinon.stub(store, 'unloadAll');

        // when
        const result = await route.model({ type: 'all' });
        // then
        assert.ok(store.findAll.notCalled);
        assert.deepEqual(result, { courses, currentCourse: undefined, type: 'all' });
      });
    });

    module('currentCourse', function () {
      test('it fetches target-profile-overview matching targetProfileId query param', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/catalogue/list');
        const store = this.owner.lookup('service:store');
        const currentUser = this.owner.lookup('service:current-user');
        const organizationId = Symbol('organizationId');
        sinon.stub(currentUser, 'organization').value({ id: organizationId });
        const courses = [Symbol('Course')];
        const currentCourse = Symbol('CurrentCourse');

        sinon.stub(store, 'peekAll').withArgs('course').returns(courses);
        sinon.stub(store, 'findAll');
        sinon
          .stub(store, 'findRecord')
          .withArgs('target-profile-overview', 1, { adapterOptions: { organizationId } })
          .returns(currentCourse);

        // when
        const result = await route.model({ type: 'all', targetProfileId: 1 });

        // then
        assert.ok(store.findRecord.calledOnce);
        assert.deepEqual(result, { courses, currentCourse, type: 'all' });
      });
    });
  });

  module('handleCache', function () {
    test('it unloads course items from cache when organization change', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      const organizationId = Symbol('organizationId');
      sinon.stub(currentUser, 'organization').value({ id: organizationId });

      const route = this.owner.lookup('route:authenticated/catalogue/list');
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'unloadAll');

      // when
      route.handleCache();

      // then
      assert.ok(store.unloadAll.calledOnceWithExactly('course'));
    });
    test('it does nothing when organization has not changed', function (assert) {
      // given
      const currentUser = this.owner.lookup('service:current-user');
      const organizationId = Symbol('organizationId');
      sinon.stub(currentUser, 'organization').value({ id: organizationId });

      const route = this.owner.lookup('route:authenticated/catalogue/list');
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'unloadAll');
      route.handleCache();
      store.unloadAll.reset();

      // when
      route.handleCache();

      // then
      assert.ok(store.unloadAll.notCalled);
    });
  });

  module('resetController', function () {
    test('should reset targetProfileId and blueprintId when isExiting is true', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/catalogue/list');
      const controller = { set: sinon.stub() };

      // when
      route.resetController(controller, true);

      // then
      assert.true(controller.set.firstCall.calledWithExactly('targetProfileId', null));
      assert.true(controller.set.secondCall.calledWithExactly('blueprintId', null));
    });
  });
});
