import { assertEnumValue, assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.ts';

const TextTagEnumValues = Object.freeze({
  NONE: ' ',
  CONTEXT: 'context',
  DID_YOU_KNOW: 'did-you-know',
  FURTHER_INFORMATION: 'further-information',
  TIP: 'tip',
});

class Text extends Element {
  constructor({ id, content, tag }) {
    super({ id, type: 'text', tag: ' ' });

    assertNotNullOrUndefined(content, 'The content is required for a text');
    assertEnumValue(
      TextTagEnumValues,
      tag,
      "The tag value must be one of: ' ', 'context', 'did-you-know', 'further-information', 'tip'",
    );

    this.content = content;
    this.tag = tag;
  }
}

export { Text };
