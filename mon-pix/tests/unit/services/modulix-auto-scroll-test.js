import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Services | Module | ModulixAutoScroll', function (hooks) {
  setupTest(hooks);

  module('#setHTMLElementScrollOffsetCssProperty', function () {
    test('should set --scroll-offset to the given html element', function (assert) {
      // given
      const modulixAutoScrollService = this.owner.lookup('service:modulix-auto-scroll');
      const htmlElement = document.createElement('div');

      // when
      modulixAutoScrollService.setHTMLElementScrollOffsetCssProperty(htmlElement);

      // then
      assert.strictEqual(htmlElement.style.getPropertyValue('--scroll-offset'), '70px');
    });
  });

  module('#focusAndScroll', function () {
    test('should call focus on given html element', function (assert) {
      // given
      const modulixAutoScrollService = this.owner.lookup('service:modulix-auto-scroll');
      const htmlElement = document.createElement('div');
      htmlElement.focus = sinon.stub();

      // when
      modulixAutoScrollService.focusAndScroll(htmlElement);

      // then
      sinon.assert.calledWith(htmlElement.focus, { preventScroll: true });
      assert.ok(true);
    });

    module('according to user preferences', function (hooks) {
      let modulixAutoScrollService;
      let htmlElement;
      let scrollStub;
      let getWindowScrollYStub;

      hooks.beforeEach(function () {
        modulixAutoScrollService = this.owner.lookup('service:modulix-auto-scroll');

        const givenHtmlElementBoundingClientRectTop = 20;
        htmlElement = document.createElement('div');
        htmlElement.getBoundingClientRect = sinon.stub().returns({
          top: givenHtmlElementBoundingClientRectTop,
        });
        scrollStub = sinon.stub();

        const givenWindowScrollY = 5;
        getWindowScrollYStub = sinon.stub();
        getWindowScrollYStub.returns(givenWindowScrollY);
      });

      function executeFocusAndScroll(givenUserPrefersReducedMotion) {
        const userPrefersReducedMotionStub = sinon.stub();
        userPrefersReducedMotionStub.returns(givenUserPrefersReducedMotion);
        modulixAutoScrollService.focusAndScroll(htmlElement, {
          scroll: scrollStub,
          userPrefersReducedMotion: userPrefersReducedMotionStub,
          getWindowScrollY: getWindowScrollYStub,
        });
      }

      function expectScrollCalledWith(expectedBehavior) {
        const expectedScrollToTop = -45;
        sinon.assert.calledWith(scrollStub, { top: expectedScrollToTop, behavior: expectedBehavior });
      }

      module('when user prefers reduced motions', function () {
        test('should call scroll to the given html element with "instant" behavior', function (assert) {
          // given
          const givenUserPrefersReducedMotion = true;

          // when
          executeFocusAndScroll(givenUserPrefersReducedMotion);

          // then
          const expectedBehavior = 'instant';
          expectScrollCalledWith(expectedBehavior);
          assert.ok(true);
        });
      });

      module('when user does not prefer reduced motions', function () {
        test('should call scroll to the given html element with "smooth" behavior', function (assert) {
          // given
          const givenUserPrefersReducedMotion = false;

          // when
          executeFocusAndScroll(givenUserPrefersReducedMotion);

          // then
          const expectedBehavior = 'smooth';
          expectScrollCalledWith(expectedBehavior);
          assert.ok(true);
        });
      });
    });
  });
});
