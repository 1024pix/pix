import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class TransitionText {
  constructor({ content, grainId }) {
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour un texte de transition');
    assertNotNullOrUndefined(grainId, "L'id de grain est obligatoire pour un texte de transition");

    this.content = content;
    this.grainId = grainId;
  }
}

export { TransitionText };
