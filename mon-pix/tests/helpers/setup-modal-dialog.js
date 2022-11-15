import { setupTest } from 'ember-qunit';

export default function setupModalDialog(options) {
  const hooks = setupTest(options);

  hooks.beforeEach(function () {
    this.rootEl = document.querySelector(this.owner.rootElement);
    this.modalDivEl = document.createElement('div');
    this.modalDivEl.id = 'modal-overlays';
    this.rootEl.appendChild(this.modalDivEl);
  });

  hooks.afterEach(function () {
    this.rootEl.removeChild(this.modalDivEl);
  });

  return hooks;
}
