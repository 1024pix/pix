import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/combined-course-participations', function (hooks) {
  setupTest(hooks);
  let currentUser;

  hooks.beforeEach(function () {
    currentUser = this.owner.lookup('service:current-user');
    currentUser.organization = {
      divisions: sinon.stub(),
      groups: sinon.stub(),
      isManagingStudents: false,
    };
  });

  module('model', function () {
    test('fetch model for combined course', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participations');
      const store = this.owner.lookup('service:store');
      const combinedCourseParticipations = Symbol('combinedCourseParticipations');
      const combinedCourseId = Symbol('combinedCourseId');
      const combinedCourse = { id: combinedCourseId };
      sinon.stub(route, 'modelFor').returns(combinedCourse);
      sinon
        .stub(store, 'query')
        .withArgs('combined-course-participation', {
          combinedCourseId,
          page: {
            number: undefined,
            size: undefined,
          },
          filters: {
            fullName: undefined,
            statuses: undefined,
            divisions: undefined,
            groups: undefined,
          },
        })
        .resolves(combinedCourseParticipations);

      // when
      const result = await route.model({});

      // then
      assert.deepEqual(result, { combinedCourse, combinedCourseParticipations, divisions: null });
    });

    test('fetch combined-course participations with pagination', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participations');
      const store = this.owner.lookup('service:store');
      const combinedCourseParticipations = Symbol('combinedCourseParticipations');
      const combinedCourseId = Symbol('combinedCourseId');
      const combinedCourse = { id: combinedCourseId };
      sinon.stub(route, 'modelFor').returns(combinedCourse);

      sinon
        .stub(store, 'query')
        .withArgs('combined-course-participation', {
          combinedCourseId,
          page: {
            number: 2,
            size: 20,
          },
          filters: {
            fullName: 'fullName',
            statuses: ['STARTED'],
            divisions: ['6eme'],
            groups: ['A'],
          },
        })
        .resolves(combinedCourseParticipations);

      // when
      const result = await route.model({
        pageNumber: 2,
        pageSize: 20,
        fullName: 'fullName',
        statuses: ['STARTED'],
        divisions: ['6eme'],
        groups: ['A'],
      });

      // then
      assert.deepEqual(result, { combinedCourse, combinedCourseParticipations, divisions: null });
    });

    test('fetch divisions data on SCO organization managing students', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/combined-course/participations');
      const store = this.owner.lookup('service:store');
      const combinedCourseParticipations = Symbol('combinedCourseParticipations');
      const combinedCourseId = Symbol('combinedCourseId');
      const combinedCourse = { id: combinedCourseId };
      sinon.stub(route, 'modelFor').returns(combinedCourse);
      sinon.stub(store, 'query').withArgs('combined-course-participation').resolves(combinedCourseParticipations);

      const divisionStub = sinon.stub();
      currentUser.loadDivisions = divisionStub;

      divisionStub.returns();

      await route.model({});

      assert.ok(divisionStub.called);
    });
  });
});
