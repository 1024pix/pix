import { on } from '@ember/object/evented';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
import { EKMixin as EmberKeyboardMixin, keyUp } from 'ember-keyboard';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

export default ModalDialog.extend(EmberKeyboardMixin, {

  wrapperClassNames: ['pix-modal-wrapper'],
  overlayClassNames: ['pix-modal-overlay'],
  containerClassNames: ['pix-modal-dialog'],
  translucentOverlay: true,
  targetAttachment: 'none',
  wrapperClass: 'centered-scrolling-wrapper',
  overlayClass: 'centered-scrolling-overlay',
  containerClass: 'centered-scrolling-container',

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
  },

  closeOnEsc: on(keyUp('Escape'), function() {
    this.get('onClose')();
  }),

  // XXX Fix component tests based on pix-modal
  // cf. https://github.com/yapplabs/ember-modal-dialog/issues/267
  destinationElementId: computed(function() {
    /*
      everywhere except test, this property will be overwritten
      by the initializer that appends the modal container div
      to the DOM. because initializers don't run in unit/integration
      tests, this is a nice fallback.
    */
    if (ENV.environment === 'test') {
      return 'ember-testing';
    }
  }),
});
