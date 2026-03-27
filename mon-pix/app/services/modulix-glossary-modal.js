import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixGlossaryModal extends Service {
  @tracked isBookModalOpen = false;
  @tracked selectedWord = null;

  openBookModal() {
    this.selectedWord = null;
    this.isBookModalOpen = true;
  }

  closeBookModal() {
    this.isBookModalOpen = false;
  }

  @action handleGlossaryWordClick(event) {
    const wordButton = event.target.closest('.module-glossary-word');
    if (wordButton) {
      this.selectedWord = wordButton.textContent;
      this.isBookModalOpen = true;
    }
  }
}
