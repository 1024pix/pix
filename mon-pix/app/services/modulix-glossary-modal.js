import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixGlossaryModal extends Service {
  @tracked isBookModalOpen = false;

  openBookModal() {
    this.isBookModalOpen = true;
  }

  closeBookModal() {
    this.isBookModalOpen = false;
  }

  @action handleGlossaryWordClick(event) {
    if (event.target.closest('.module-glossary-word')) {
      this.openBookModal();
    }
  }
}
