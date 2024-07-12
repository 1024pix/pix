import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.js';

class Embed extends Element {
  constructor({ id, isCompletionRequired, title, url, instruction, height }) {
    super({ id, type: 'embed' });

    assertNotNullOrUndefined(isCompletionRequired, 'The isCompletionRequired attribute is required for an embed');
    assertNotNullOrUndefined(title, 'The title is required for an embed');
    assertNotNullOrUndefined(url, 'The url is required for an embed');
    assertNotNullOrUndefined(height, 'The height is required for an embed');

    this.isCompletionRequired = isCompletionRequired;
    this.title = title;
    this.url = url;
    this.instruction = instruction;
    this.height = height;
  }
}

export { Embed };
