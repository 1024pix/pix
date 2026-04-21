import sinon from 'sinon';

import { getVerifiedCode } from '../../../../../src/quest/domain/usecases/get-verified-code.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Unit | Domain | Usecases | getVerifiedCode', function () {
  it('should throw error if not a NotFoundError', async function () {
    // given
    const code = Symbol('code');

    const campaignRepositoryStub = { getByCode: sinon.stub() };
    const combinedCourseRepositoryStub = { getByCode: sinon.stub() };

    campaignRepositoryStub.getByCode.rejects(new Error('oops'));

    // when
    const error = await catchErr(getVerifiedCode)({
      code,
      campaignRepository: campaignRepositoryStub,
      combinedCourseRepository: combinedCourseRepositoryStub,
    });

    // then
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.equal('oops');
  });
});
