import { on } from '@ember/object/evented';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
import { EKMixin as EmberKeyboardMixin, keyUp } from 'ember-keyboard';

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
  })
});
