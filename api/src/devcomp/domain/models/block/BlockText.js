import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockText {
  constructor({ content }) {
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour un bloc de texte');
    this.content = content;
    this.type = 'text';
  }
}

export { BlockText };
