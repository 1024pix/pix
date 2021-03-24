const { databaseBuilder, expect } = require('../../../test-helper');

const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

const dissociateSchoolingRegistrations = require('../../../../lib/domain/usecases/dissociate-schooling-registrations');

describe('Integration | UseCases | dissociate-schooling-registrations', function() {

  it('should dissociate schooling registration by user id', async function() {
    // given
    const userId = databaseBuilder.factory.buildSchoolingRegistrationWithUser().userId;
    databaseBuilder.factory.buildSchoolingRegistration({ userId });
    databaseBuilder.factory.buildSchoolingRegistration({ userId });
    await databaseBuilder.commit();

    // when
    const updatedUserDetailsForAdmin = await dissociateSchoolingRegistrations({
      userId,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(updatedUserDetailsForAdmin.schoolingRegistrations).to.be.empty;
  });
});
