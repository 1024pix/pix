import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Image extends Element {
  constructor({ id, url, alt, alternativeText }) {
    super({ id, type: 'image' });

    assertNotNullOrUndefined(url, "L'URL est obligatoire pour une image");
    assertNotNullOrUndefined(alt, 'Le contenu alt est obligatoire pour une image');
    assertNotNullOrUndefined(alternativeText, "L'instruction alternative est obligatoire pour une image");

    this.url = url;
    this.alt = alt;
    this.alternativeText = alternativeText;
  }
}

export { Image };
