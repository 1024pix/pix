import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import EmberObject from '@ember/object';

import sinon from 'sinon';

module('Unit | Route | authenticated/certifications', (hooks) => {
  setupTest(hooks);

  module('beforeModel', () => {
    test('should redirect to application when featureToggles.isCertificationResultsInOrgaEnabled is false', function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should redirect to application when currentUser.isAdminInOrganization is true && currentUser.isSCOManagingStudents is false', function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = false;
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should redirect to application when currentUser.isAdminInOrganization is false & currentUser.isSCOManagingStudents is true', function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        isSCOManagingStudents = true;
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should redirect to application when currentUser.isAdminInOrganization and featureToggles.isCertificationResultsInOrgaEnabled are false', function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        isSCOManagingStudents = true;
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);
      const route = this.owner.lookup('route:authenticated.certifications');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should not redirect to application when currentUser.isAdminInOrganization and featureToggles.isCertificationResultsInOrgaEnabled are true', function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);
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

  module('#model', () => {

    test('it should return a list of options based on organization divisions', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
        organization = {
          id: 12345,
        }
      }

      class FeatureToggleStub extends Service {
        isCertificationResultsInOrgaEnabled = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:feature-toggles', FeatureToggleStub);

      const route = this.owner.lookup('route:authenticated/certifications');
      const divisions = [EmberObject.create({ name: '3èmeA' }), EmberObject.create({ name: '2ndE' })];
      const findRecordStub = sinon.stub();
      route.store.findRecord = findRecordStub;
      route.store.query = sinon.stub().resolves(divisions);

      // when
      const actualOptions = await route.model();

      // then
      assert.deepEqual(actualOptions,
        {
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
        },
      );
    });
  });
});
