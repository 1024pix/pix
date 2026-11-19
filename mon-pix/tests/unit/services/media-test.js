import { settled } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import breakpoints from 'mon-pix/breakpoints';
import MediaService from 'mon-pix/services/media';
import { module, test } from 'qunit';
import sinon from 'sinon';

function createMediaQueryList(matches) {
  const listeners = new Set();
  return {
    matches,
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
    change(matches) {
      this.matches = matches;
      listeners.forEach((listener) => listener({ matches }));
    },
    listeners,
  };
}

module('Unit | Service | media', function (hooks) {
  setupTest(hooks);

  let mediaQueryLists;

  hooks.beforeEach(function () {
    mediaQueryLists = {
      [breakpoints.mobile]: createMediaQueryList(false),
      [breakpoints.tablet]: createMediaQueryList(true),
      [breakpoints.desktop]: createMediaQueryList(true),
    };
    sinon.stub(window, 'matchMedia').callsFake((query) => mediaQueryLists[query]);
  });

  function lookupUnmockedMedia(owner) {
    owner.register(
      'service:media',
      class extends MediaService {
        static mocked = false;
      },
    );
    return owner.lookup('service:media');
  }

  test('it defaults to desktop when mocked', function (assert) {
    // when
    const media = this.owner.lookup('service:media');

    // then
    assert.false(media.isMobile);
    assert.false(media.isTablet);
    assert.true(media.isDesktop);
  });

  test('it reflects the matching breakpoints when not mocked', function (assert) {
    // when
    const media = lookupUnmockedMedia(this.owner);

    // then
    assert.false(media.isMobile);
    assert.true(media.isTablet);
    assert.true(media.isDesktop);
  });

  test('it updates when a breakpoint starts or stops matching', function (assert) {
    // given
    const media = lookupUnmockedMedia(this.owner);

    // when
    mediaQueryLists[breakpoints.mobile].change(true);
    mediaQueryLists[breakpoints.tablet].change(false);
    mediaQueryLists[breakpoints.desktop].change(false);

    // then
    assert.true(media.isMobile);
    assert.false(media.isTablet);
    assert.false(media.isDesktop);
  });

  test('it stops listening to breakpoint changes when destroyed', async function (assert) {
    // given
    const media = lookupUnmockedMedia(this.owner);

    // when
    media.destroy();
    await settled();

    // then
    Object.values(mediaQueryLists).forEach((mediaQueryList) => assert.strictEqual(mediaQueryList.listeners.size, 0));
  });
});
