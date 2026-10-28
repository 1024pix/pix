import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixGlossaryService extends Service {
  @tracked openedTermId = null;
  #definitionsByWord = new Map();

  setEntries(glossary) {
    this.#definitionsByWord = new Map((glossary ?? []).map(({ word, definition }) => [word, definition]));
  }

  getDefinition(word) {
    return this.#definitionsByWord.get(word);
  }

  isOpened(termId) {
    return this.openedTermId === termId;
  }

  open(termId) {
    this.openedTermId = termId;
  }

  close(termId) {
    if (this.isOpened(termId)) {
      this.openedTermId = null;
    }
  }
}
