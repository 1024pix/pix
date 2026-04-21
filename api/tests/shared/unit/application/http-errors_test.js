import sinon from 'sinon';

import { BaseHttpError, HttpErrors } from '../../../../src/shared/application/http-errors.js';

describe('Unit | Shared | Application | HttpErrors', function () {
  it('instantiates BaseHttpError', async function () {
    //given
    const dependencies = { getRequestId: sinon.stub() };
    dependencies.getRequestId.returns(null);

    // when
    const error = new BaseHttpError('', dependencies);

    //then
    expect(error).to.be.instanceOf(HttpErrors.BaseHttpError);
    expect({ ...error }).to.deep.equal({ id: null, status: 400, title: 'Default Bad Request' });
  });

  it('returns a BaseHttpError given request ID', async function () {
    //given
    const requestId = Symbol('requestId');
    const dependencies = { getRequestId: sinon.stub() };
    dependencies.getRequestId.returns(requestId);

    //when
    const error = new BaseHttpError('', dependencies);

    //then
    expect({ ...error }).to.deep.equal({ title: 'Default Bad Request', status: 400, id: requestId });
  });
});
