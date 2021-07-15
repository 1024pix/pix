import ResponseBlock from './response-block';

export default class InputBlock extends ResponseBlock {

  constructor({ input, inputIndex }) {
    super({ input, inputIndex });
    this.setType('input');
  }
}
