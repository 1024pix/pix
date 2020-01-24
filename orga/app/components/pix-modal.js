import { on } from '@ember/object/evented';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
import { EKMixin as EmberKeyboardMixin, keyUp } from 'ember-keyboard';

export default ModalDialog.extend(EmberKeyboardMixin, {

  translucentOverlay: true,
  targetAttachment: 'none',
  wrapperClass: 'centered-scrolling-wrapper',
  overlayClass: 'centered-scrolling-overlay',
  containerClass: 'centered-scrolling-container',

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true);
    this.set('wrapperClassNames', ['pix-modal-wrapper']);
    this.set('overlayClassNames', ['pix-modal-overlay']);
  },

  didRender() {
    this._super(...arguments);
    document.querySelector('#modal-overlays').classList.add('active');
    document.body.classList.add('centered-modal-showing');
  },

  willDestroyElement() {
    document.querySelector('#modal-overlays').classList.remove('active');
    document.body.classList.remove('centered-modal-showing');
    this._super(...arguments);
  },

  closeOnEsc: on(keyUp('Escape'), function() {
    this.onClose();
  })

});
