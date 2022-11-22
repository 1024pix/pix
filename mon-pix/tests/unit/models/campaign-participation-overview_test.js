import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Campaign-Participation-Overview', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#status', function () {
    module('when the campaign is not archived', function () {
      module('when the participation status is "started"', function () {
        test('should return the status "ONGOING"', function (assert) {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'STARTED',
          });
          // when / then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(model.cardStatus, 'ONGOING');
        });
      });

      module('when the particiaption status is "TO_SHARE" and the participation is not shared"', function () {
        test('should return the status "TO_SHARE"', function (assert) {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'TO_SHARE',
            isShared: false,
            disabledAt: null,
          });
          // when / then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(model.cardStatus, 'TO_SHARE');
        });
      });

      module('when the participation status is "SHARED" and the participation is shared"', function () {
        test('should return the status "ENDED"', function (assert) {
          // given
          const model = store.createRecord('campaign-participation-overview', {
            status: 'SHARED',
            disabledAt: null,
            isShared: true,
          });
          // when / then
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(model.cardStatus, 'ENDED');
        });
      });
    });

    module('when the participation is disabled"', function () {
      test('should return the status "disabled"', function (assert) {
        // given
        const model = store.createRecord('campaign-participation-overview', {
          status: 'SHARED',
          isShared: true,
          disabledAt: new Date('2021-01-01'),
        });
        // when / then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(model.cardStatus, 'DISABLED');
      });
    });
  });
});
