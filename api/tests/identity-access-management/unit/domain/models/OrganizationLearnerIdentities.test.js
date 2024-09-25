import { OrganizationLearnerNotBelongToOrganizationIdentityError } from '../../../../../src/identity-access-management/domain/errors.js';
import { OrganizationLearnerIdentities } from '../../../../../src/identity-access-management/domain/models/OrganizationLearnerIdentities.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | OrganizationIdentity', function () {
  describe('#constructor', function () {
    let values;
    const organizationId = 42;

    beforeEach(function () {
      const organizationLearnerIdentity = {
        id: 32,
        birthdate: '01/01/2022',
        division: '6B',
        firstName: 'Holly',
        lastName: 'Garchie',
        organizationId,
        userId: 12,
        username: 'holly.garchie',
      };

      const otherOrganizationLearnerIdentity = {
        id: 32,
        birthdate: '01/01/2022',
        division: '6B',
        firstName: 'Lee',
        lastName: 'Tige',
        organizationId,
        userId: 12,
        username: 'holly.garchie',
      };

      values = [organizationLearnerIdentity, otherOrganizationLearnerIdentity];
    });

    it('builds a OrganizationLearnerIdentities model', function () {
      // when
      const organizationIdentity = new OrganizationLearnerIdentities({
        id: organizationId,
        hasScoGarIdentityProvider: true,
        values,
      });

      // then
      expect(organizationIdentity.id).to.eq(organizationId);
      expect(organizationIdentity.hasScoGarIdentityProvider).to.be.true;
      expect(organizationIdentity.values).to.deep.equal(values);
    });

    context("when one of values does not belong to 'organizationId'", function () {
      it('throws an NotBelongingToOrganizationIdentityError', function () {
        // given
        const otherOrganizationId = 100;
        values[0].organizationId = otherOrganizationId;

        // when
        const error = catchErrSync(
          () =>
            new OrganizationLearnerIdentities({
              id: organizationId,
              hasScoGarIdentityProvider: true,
              values,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(OrganizationLearnerNotBelongToOrganizationIdentityError);
      });
    });
  });
});
