import { A as EmberArray } from '@ember/array';
import { computed } from '@ember/object';
import { classify } from '@ember/string';
import { getOwner } from '@ember/application';
import MediaService from 'ember-responsive/media';
import { registerAsyncHelper } from '@ember/test';

MediaService.reopen({
  // Change this if you want a different default breakpoint in tests.
  _defaultBreakpoint: 'desktop',

  _breakpointArr: computed('breakpoints', function() {
    return Object.keys(this.get('breakpoints')) || EmberArray();
  }),

  _forceSetBreakpoint(breakpoint) {
    let found = false;

    const props = {};
    this.get('_breakpointArr').forEach(function(bp) {
      const val = bp === breakpoint;
      if (val) {
        found = true;
      }

      props[`is${classify(bp)}`] = val;
    });

    if (found) {
      this.setProperties(props);
    } else {
      throw new Error(
        `You tried to set the breakpoint to ${breakpoint}, which is not in your app/breakpoint.js file.`
      );
    }
  },

  match() {
  }, // do not set up listeners in test

  init() {
    this._super(...arguments);
    this._forceSetBreakpoint(this.get('_defaultBreakpoint'));
  }
});

export default registerAsyncHelper('setBreakpoint', function(app, breakpoint) {
  // this should use getOwner once that's supported
  const mediaService = app.__deprecatedInstance__.lookup('service:media');
  mediaService._forceSetBreakpoint(breakpoint);
});

export function setBreakpointForIntegrationTest(container, breakpoint) {
  const mediaService = getOwner(container).lookup('service:media');
  mediaService._forceSetBreakpoint(breakpoint);
  container.set('media', mediaService);

  return mediaService;
}
