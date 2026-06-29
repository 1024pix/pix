import { BaseHttpError } from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Application | ', function () {
  it('instantiates BaseHttpError', async function () {
    // when
    const error = new BaseHttpError('');

    //then
    expect(error).to.be.instanceOf(BaseHttpError);
    expect({ ...error }).to.deep.equal({ status: 400, title: 'Default Bad Request' });
  });
});
