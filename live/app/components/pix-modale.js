import Ember from 'ember';
import ModalDialog from 'ember-modal-dialog/components/modal-dialog';
import { EKMixin as EmberKeyboardMixin, keyDown } from 'ember-keyboard';

function _setFocusOnFirstTabbableElement(modalId) {
  const $tabbableElementInModal = Ember.$(modalId).find(':tabbable');

  const $firstElementToFocus = $tabbableElementInModal.get(0);
  $firstElementToFocus.focus();
}

export default ModalDialog.extend(EmberKeyboardMixin, {

  wrapperClassNames: ['pix-modal-wrapper'],
  containerClassNames: ['pix-modal'],
  keyboardActivated: true,
  translucentOverlay: true,

  didInsertElement() {
    this._super(...arguments);

    const modalId = `#${Ember.$('.ember-modal-dialog').attr('id')}`;

    _setFocusOnFirstTabbableElement(modalId);

    Ember.$(modalId).find(':tabbable').last().on('blur', function() {
      _setFocusOnFirstTabbableElement(modalId);
    });
  },

  closeOnEsc: Ember.on(keyDown('Escape'), function() {
    this.sendAction('close');
  })
});
