import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixGlossaryModal extends Service {
  @tracked isBookModalOpen = false;
  @tracked selectedWord = null;

  openBookModal() {
    this.isBookModalOpen = true;
  }

  closeBookModal() {
    this.isBookModalOpen = false;
    this.selectedWord = null;
  }

  @action openForWord(event) {
    this.selectedWord = event.detail.word;
    this.openBookModal();
  }
}
