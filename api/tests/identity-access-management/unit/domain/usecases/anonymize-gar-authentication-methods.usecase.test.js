import { anonymizeGarAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/anonymize-gar-authentication-methods.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | anonymize-gar-authentication-methods', function () {
  it('returns anonymized userId number and total of userIds', async function () {
    // given
    const authenticationMethodRepository = {
      batchAnonymizeByUserIds: sinon.stub().resolves({ anonymizedUserCount: 3 }),
    };
    const userIds = [1, 2, 3];

    // when
    const result = await anonymizeGarAuthenticationMethods({ userIds, authenticationMethodRepository });

    // then
    expect(result.anonymized).to.be.equal(3);
    expect(result.total).to.be.equal(3);
  });
});
