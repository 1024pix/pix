import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should redirect to application when currentUser.isAdminInOrganization is true && currentUser.isSCOManagingStudents is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should redirect to application when currentUser.isAdminInOrganization is false & currentUser.isSCOManagingStudents is true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should redirect to application when currentUser.isAdminInOrganization is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should not redirect to application when currentUser.isAdminInOrganization and currentUser.isSCOManagingStudents are true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.notCalled(replaceWithStub);
      assert.ok(true);
    });
  });

  module('#model', function () {
    test('it should return a list of options based on organization divisions', async function (assert) {
      // given
      const divisions = [EmberObject.create({ name: '3èmeA' }), EmberObject.create({ name: '2ndE' })];
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
        organization = EmberObject.create({
          id: 12345,
          divisions,
        });
      }

      const findRecordStub = sinon.stub();
      class StoreStub extends Service {
        findRecord = findRecordStub;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:store', StoreStub);

      const route = this.owner.lookup('route:authenticated/certifications');

      // when
      const actualOptions = await route.model();

      // then
      assert.deepEqual(actualOptions, {
        options: [
          {
            label: '3èmeA',
            value: '3èmeA',
          },
          {
            label: '2ndE',
            value: '2ndE',
          },
        ],
      });
    });
  });
});
