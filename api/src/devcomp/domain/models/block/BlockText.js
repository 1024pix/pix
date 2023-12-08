import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class BlockText {
  constructor({ content, type }) {
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour un bloc de texte');
    assertNotNullOrUndefined(type, 'Le type est obligatoire pour un bloc de texte');
    this.content = content;
    this.type = type;
  }
}

export { BlockText };
