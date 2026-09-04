import { expect } from 'chai';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');

describe('Integration | Identity Access Management | Domain | UseCase | revoke-session', function () {
  it('revokes user’s session given a user ID and session ID', async function () {
    // given
    const userId = '713705';
    const sessionId = crypto.randomUUID();

    // when
    await usecases.revokeSession({ userId, sessionId });

    // then
    const revokedSessionIds = await revokedUserAccessTemporaryStorage.smembers(`${userId}:sessions`);
    expect(revokedSessionIds).to.deep.equal([sessionId]);
  });
});
