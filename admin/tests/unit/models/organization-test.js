import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  module('#isComputeCertificabilityEnabled', function () {
    module('#get', function () {
      test('it returns true when feature is enabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY']: { active: true } },
        });

        // when
        const isComputeCertificabilityEnabled = model.isComputeCertificabilityEnabled;

        // then
        assert.true(isComputeCertificabilityEnabled);
      });

      test('it returns false when feature is disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY']: { active: false } },
        });

        // when
        const isComputeCertificabilityEnabled = model.isComputeCertificabilityEnabled;

        // then
        assert.false(isComputeCertificabilityEnabled);
      });

      test('it returns false when no features are provided', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        const isComputeCertificabilityEnabled = model.isComputeCertificabilityEnabled;

        // then
        assert.false(isComputeCertificabilityEnabled);
      });
    });
  });

  module('#isPlacesManagementEnabled', function () {
    module('#get', function () {
      test('it returns true when feature is enabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: { active: true } },
        });

        // when
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;

        // then
        assert.true(isPlacesManagementEnabled);
      });
      test('it returns false when feature is disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: { active: false } },
        });

        // when
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;

        // then
        assert.false(isPlacesManagementEnabled);
      });
      test('it returns false when no features are provided', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;

        // then
        assert.false(isPlacesManagementEnabled);
      });
    });

    module('#set', function () {
      test('it enables feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: { active: false } },
        });

        // when
        model.isPlacesManagementEnabled = true;

        // then
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;
        assert.true(isPlacesManagementEnabled);
      });
      test('it disable feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: { active: true } },
        });
        // when
        model.isPlacesManagementEnabled = false;

        // then
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;
        assert.false(isPlacesManagementEnabled);
      });
      test('it handles having no features yet', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        model.isPlacesManagementEnabled = true;

        // then
        const isPlacesManagementEnabled = model.isPlacesManagementEnabled;
        assert.true(isPlacesManagementEnabled);
      });
    });
  });

  module('#isMultipleSendingAssessmentEnabled', function () {
    module('#get', function () {
      test('it returns true when feature is enabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: { active: true } },
        });

        // when
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;

        // then
        assert.true(isMultipleSendingAssessmentEnabled);
      });
      test('it returns false when feature is disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: { active: false } },
        });

        // when
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;

        // then
        assert.false(isMultipleSendingAssessmentEnabled);
      });
      test('it returns false when no features are provided', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;

        // then
        assert.false(isMultipleSendingAssessmentEnabled);
      });
    });

    module('#set', function () {
      test('it enables feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: { active: false } },
        });

        // when
        model.isMultipleSendingAssessmentEnabled = true;

        // then
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;
        assert.true(isMultipleSendingAssessmentEnabled);
      });
      test('it disable feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: { active: true } },
        });
        // when
        model.isMultipleSendingAssessmentEnabled = false;

        // then
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;
        assert.false(isMultipleSendingAssessmentEnabled);
      });
      test('it handles having no features yet', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        model.isMultipleSendingAssessmentEnabled = true;

        // then
        const isMultipleSendingAssessmentEnabled = model.isMultipleSendingAssessmentEnabled;
        assert.true(isMultipleSendingAssessmentEnabled);
      });
    });
  });

  module('#archivedFormattedDate', function () {
    test('it formats the archived date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { archivedAt: new Date('2022-02-22') });

      // when
      const archivedFormattedDate = model.archivedFormattedDate;

      // then
      assert.strictEqual(archivedFormattedDate, '22/02/2022');
    });
  });

  module('#createdAtFormattedDate', function () {
    test('it formats the organization creation date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { createdAt: new Date('2022-09-02') });

      // when
      const createdAtFormattedDate = model.createdAtFormattedDate;

      // then
      assert.strictEqual(createdAtFormattedDate, '02/09/2022');
    });
  });

  module('#isArchived', function () {
    test('it return whether organization is archived', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { archivedAt: '2022-12-25', archivistFullName: 'Anne Héantie' });

      // when
      const isOrganizationArchived = model.isArchived;

      // then
      assert.true(isOrganizationArchived);
    });
  });

  module('#dataProtectionOfficerFullName', function () {
    test('it return the data protection officer full name', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', {
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      });

      // when & then
      assert.strictEqual(model.dataProtectionOfficerFullName, 'Justin Ptipeu');
    });
  });
});
