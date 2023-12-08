import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  module('#enablePlacesManagement', function () {
    module('#get', function () {
      test('it returns true when feature is enabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: true },
        });

        // when
        const enablePlacesManagement = model.enablePlacesManagement;

        // then
        assert.true(enablePlacesManagement);
      });
      test('it returns false when feature is disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: false },
        });

        // when
        const enablePlacesManagement = model.enablePlacesManagement;

        // then
        assert.false(enablePlacesManagement);
      });
      test('it returns false when no features are provided', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        const enablePlacesManagement = model.enablePlacesManagement;

        // then
        assert.false(enablePlacesManagement);
      });
    });

    module('#set', function () {
      test('it enables feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: false },
        });

        // when
        model.enablePlacesManagement = true;

        // then
        const enablePlacesManagement = model.enablePlacesManagement;
        assert.true(enablePlacesManagement);
      });
      test('it disable feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['PLACES_MANAGEMENT']: true },
        });
        // when
        model.enablePlacesManagement = false;

        // then
        const enablePlacesManagement = model.enablePlacesManagement;
        assert.false(enablePlacesManagement);
      });
      test('it handles having no features yet', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        model.enablePlacesManagement = true;

        // then
        const enablePlacesManagement = model.enablePlacesManagement;
        assert.true(enablePlacesManagement);
      });
    });
  });

  module('#enableMultipleSendingAssessment', function () {
    module('#get', function () {
      test('it returns true when feature is enabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: true },
        });

        // when
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;

        // then
        assert.true(enableMultipleSendingAssessment);
      });
      test('it returns false when feature is disabled', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: false },
        });

        // when
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;

        // then
        assert.false(enableMultipleSendingAssessment);
      });
      test('it returns false when no features are provided', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;

        // then
        assert.false(enableMultipleSendingAssessment);
      });
    });

    module('#set', function () {
      test('it enables feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: false },
        });

        // when
        model.enableMultipleSendingAssessment = true;

        // then
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;
        assert.true(enableMultipleSendingAssessment);
      });
      test('it disable feature', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {
          features: { ['MULTIPLE_SENDING_ASSESSMENT']: true },
        });
        // when
        model.enableMultipleSendingAssessment = false;

        // then
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;
        assert.false(enableMultipleSendingAssessment);
      });
      test('it handles having no features yet', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('organization', {});

        // when
        model.enableMultipleSendingAssessment = true;

        // then
        const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;
        assert.true(enableMultipleSendingAssessment);
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
