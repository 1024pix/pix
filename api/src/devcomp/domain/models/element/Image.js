import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.js';

class Image extends Element {
  constructor({ id, url, alt, alternativeText }) {
    super({ id, type: 'image' });

    assertNotNullOrUndefined(url, 'The URL is required for an image');
    assertNotNullOrUndefined(alt, 'The alt text is required for an image');
    assertNotNullOrUndefined(alternativeText, 'The alternative text is required for an image');

    this.url = url;
    this.alt = alt;
    this.alternativeText = alternativeText;
  }
}

export { Image };
