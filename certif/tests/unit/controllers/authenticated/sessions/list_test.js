import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/list', function (hooks) {
  setupTest(hooks);

  module('#displayNoSessionPanel', function () {
    module('when there are sessions', function () {
      test('should return false', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/list');
        controller.model = {
          sessionSummaries: {
            meta: { hasSessions: true },
          },
        };

        // when
        const displayNoSessionPanel = controller.displayNoSessionPanel;

        // then
        assert.false(displayNoSessionPanel);
      });
    });

    module('when there are no sessions', function () {
      test('should return true', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/sessions/list');
        controller.model = {
          sessionSummaries: {
            meta: { hasSessions: false },
          },
        };

        // when
        const displayNoSessionPanel = controller.displayNoSessionPanel;

        // then
        assert.true(displayNoSessionPanel);
      });
    });
  });
});
