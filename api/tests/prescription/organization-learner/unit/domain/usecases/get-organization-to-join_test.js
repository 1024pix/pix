import sinon from 'sinon';

import { getOrganizationToJoin } from '../../../../../../src/prescription/organization-learner/domain/usecases/get-organization-to-join.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCases | get-organization-to-join', function () {
  let campaignRepository;
  let organizationToJoinRepository;
  let combinedCourseRepository;

  beforeEach(async function () {
    campaignRepository = { getByCode: sinon.stub() };
    organizationToJoinRepository = { get: sinon.stub() };
    combinedCourseRepository = { getByCode: sinon.stub() };
  });

  it('should throw a not found error if both campaign and quest are not found', async function () {
    //given
    campaignRepository.getByCode.resolves(null);
    combinedCourseRepository.getByCode.rejects(new NotFoundError());

    //when
    const error = await catchErr(getOrganizationToJoin)({
      code: 'ABC',
      organizationToJoinRepository,
      campaignRepository,
      combinedCourseRepository,
    });

    //then
    expect(error).to.be.instanceOf(NotFoundError);
  });
});
