/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-tagless-components: 0 */

import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
const defaultOrigin = 'body';

export default ModalDialog.extend({

  wrapperClassNames: ['pix-modal-wrapper'],
  overlayClassNames: ['pix-modal-overlay'],
  containerClassNames: ['pix-modal-dialog'],
  translucentOverlay: true,
  targetAttachment: 'none',
  wrapperClass: 'centered-scrolling-wrapper',
  overlayClass: 'centered-scrolling-overlay',
  containerClass: 'centered-scrolling-container',
  originId: defaultOrigin,

  didRender() {
    this._super(...arguments);
    document.querySelector('#modal-overlays').classList.add('active');
    document.body.classList.add('centered-modal-showing');
    document.querySelector('#pix-modal__close-button').focus();
  },

  willDestroyElement() {
    document.querySelector('#modal-overlays').classList.remove('active');
    document.body.classList.remove('centered-modal-showing');
    if (document.querySelector(this.originId)) {
      document.querySelector(this.originId).focus();
    } else {
      document.querySelector(defaultOrigin).focus();
    }
    this._super(...arguments);
  },

});
