import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | allowed-certification-center-access', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#get isSco', function () {
    test('should return true when AllowedCertificationCenterAccess is of type SCO', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        type: 'SCO',
      });

      // then
      assert.true(model.isSco);
    });

    test('should return false when AllowedCertificationCenterAccess is of not type SCO', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        type: 'NOT_SCO',
      });

      // then
      assert.false(model.isSco);
    });
  });

  module('#get isPro', function () {
    module('when AllowedCertificationCenterAccess type is PRO', function () {
      test('should return true', function (assert) {
        // when
        const model = store.createRecord('allowed-certification-center-access', {
          type: 'PRO',
        });

        // then
        assert.true(model.isPro);
      });
    });
  });

  module('#get isSup', function () {
    module('when AllowedCertificationCenterAccess type is SUP', function () {
      test('should return true', function (assert) {
        // when
        const model = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
        });

        // then
        assert.true(model.isSup);
      });
    });
  });

  module('#get isScoManagingStudents', function () {
    test('should return false when AllowedCertificationCenterAccess is not managing students', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: false,
      });

      // then
      assert.false(model.isScoManagingStudents);
    });

    test('should return false when AllowedCertificationCenterAccess is not of type SCO', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        type: 'not_SCO',
        isRelatedToManagingStudentsOrganization: true,
      });

      // then
      assert.false(model.isScoManagingStudents);
    });

    test('should return true when all above conditions are matched', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });

      // then
      assert.true(model.isScoManagingStudents);
    });
  });

  module('#get isAccessRestricted', function () {
    test('should return false when none of college, lycee, AEFE or agri access is blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });

      // then
      assert.false(model.isAccessRestricted);
    });

    test('should return true when college access is blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: true,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });

      // then
      assert.true(model.isAccessRestricted);
    });

    test('should return true when lycee access is blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: true,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
      });

      // then
      assert.true(model.isAccessRestricted);
    });

    test('should return true when AEFE access is blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: true,
        isAccessBlockedAgri: false,
      });

      // then
      assert.true(model.isAccessRestricted);
    });

    test('should return true when agri access is blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: true,
      });

      // then
      assert.true(model.isAccessRestricted);
    });

    test('should return true when all accesses are blocked', function (assert) {
      // when
      const model = store.createRecord('allowed-certification-center-access', {
        isAccessBlockedCollege: true,
        isAccessBlockedLycee: true,
        isAccessBlockedAEFE: true,
        isAccessBlockedAgri: true,
      });

      // then
      assert.true(model.isAccessRestricted);
    });
  });

  module('#get hasHabilitations', function () {
    test('should return true when the certification center has habilitations', function (assert) {
      // given
      const model = store.createRecord('allowed-certification-center-access', {
        habilitations: ['Pix+Droit'],
      });

      // then
      assert.true(model.hasHabilitations);
    });

    test('should return false when the certification center has no habilitations', function (assert) {
      // given
      const model = store.createRecord('allowed-certification-center-access', {
        habilitations: [],
      });

      // then
      assert.false(model.hasHabilitations);
    });
  });
});
