import { Element } from './Element.js';

/**
 * @param{object} params
 * @param{string} params.id
 * @param{string} params.title
 * @param{string} params.instruction
 * @param{string} params.functionalInstruction
 * @param{string} params.tagName
 * @param{string} params.props
 */
class CustomElement extends Element {
  constructor({ id, title, instruction, functionalInstruction, tagName, props }) {
    super({ id, type: 'custom' });

    this.tagName = tagName;
    this.props = props;
    this.title = title;
    this.instruction = instruction;
    this.functionalInstruction = functionalInstruction;
  }
}

export { CustomElement };
