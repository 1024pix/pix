const { expect, sinon } = require('../../../../test-helper');
const addAdminRole = require('../../../../../lib/domain/scope-admin/usecases/add-admin-role');
const User = require('../../../../../lib/domain/scope-admin/models/User');
const { ROLES } = require('../../../../../lib/domain/constants').PIX_ADMIN;

describe('Unit | UseCase | save-admin-member', function () {
  it('add the role the user', async function () {
    const parameters = { email: 'ice.bot@example.net', role: ROLES.SUPER_ADMIN };
    const user = new User({
      userId: 1,
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'king.k@theboss.com',
      role: ROLES.SUPPORT,
      disabledAt: null,
    });
    const expectedUser = new User({
      userId: 1,
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'king.k@theboss.com',
      role: ROLES.SUPER_ADMIN,
      disabledAt: null,
    });
    const userRepository = { getByEmail: sinon.stub(), save: sinon.stub() };
    userRepository.getByEmail.resolves(user);

    const actualUser = await addAdminRole({ ...parameters, userRepository });

    expect(actualUser).deep.equal(expectedUser);
    expect(userRepository.getByEmail).to.have.been.calledWith(parameters.email);
    expect(userRepository.save).to.have.been.calledWith(expectedUser);
  });
});
