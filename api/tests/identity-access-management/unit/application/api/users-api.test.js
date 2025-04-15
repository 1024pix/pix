import sinon from 'sinon';

import { UserDTO } from '../../../../../src/identity-access-management/application/api/models/UserDTO.js';
import { getActiveByUserIds } from '../../../../../src/identity-access-management/application/api/users-api.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | API | Users', function () {
  it('should return users', async function () {
    // given
    const firstUser = domainBuilder.buildUser({ id: 1, firstName: 'Théo', lastName: 'Courant' });
    const secondUser = domainBuilder.buildUser({ id: 2, firstName: 'Alex', lastName: 'Térieur' });

    sinon.stub(usecases, 'getActiveByUserIds');
    usecases.getActiveByUserIds.withArgs({ userIds: [1, 2] }).resolves([firstUser, secondUser]);
    const expectedUsers = [new UserDTO(firstUser), new UserDTO(secondUser)];

    // when
    const users = await getActiveByUserIds({ userIds: [1, 2] });

    // then
    expect(users).to.deep.equal(expectedUsers);
  });
});
