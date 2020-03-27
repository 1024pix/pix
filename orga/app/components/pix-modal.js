import { on } from '@ember/object/evented';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
import { EKMixin as EmberKeyboardMixin, keyUp } from 'ember-keyboard';

export default ModalDialog.extend(EmberKeyboardMixin, {

  translucentOverlay: true,
  targetAttachment: 'none',
  wrapperClass: 'pix-modal-wrapper',
  overlayClass: 'pix-modal-overlay',

  init() {
    this._super(...arguments);
    this.set('containerClassNames', ['pix-modal-dialog']);
    this.set('keyboardActivated', true);
  },

  didRender() {
    this._super(...arguments);
    document.querySelector('#modal-overlays').classList.add('active');
  },

  willDestroyElement() {
    document.querySelector('#modal-overlays').classList.remove('active');
    this._super(...arguments);
  },

  closeOnEsc: on(keyUp('Escape'), function() {
    this.onClose();
  })

});
