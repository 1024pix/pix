import * as userMembershipsRepository from '../../../../../../src/certification/shared/infrastructure/repositories/user-memberships-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Shared | Integration | Repository | UserMemberships', function () {
  describe('#findByUserId', function () {
    context('when user has no membership in no certification center', function () {
      it('returns a UserMemberships model with no memberships', async function () {
        domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({ certificationCenterId: 1 })
          .withParameters({ userId: 123 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const userMemberships = await userMembershipsRepository.findByUserId({ userId: 66 });

        const expectedUserMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .withParameters({ userId: 66 })
          .build();
        expect(userMemberships).to.deepEqualInstance(expectedUserMemberships);
      });
    });

    context('when user has memberships in certification centers', function () {
      it('returns a UserMemberships model with memberships', async function () {
        const expectedUserMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({
            id: 100,
            certificationCenterId: 1,
            peerMembershipIds: [101, 102],
            invitationIds: [1000, 2000],
          })
          .addMembership({ id: 200, certificationCenterId: 2, isDisabled: true, peerMembershipIds: [201, 202] })
          .addMembership({ id: 300, certificationCenterId: 3, isAdmin: true, invitationIds: [3000, 4000] })
          .addMembership({
            id: 400,
            certificationCenterId: 4,
            isLinkedToScoManagingStudentsOrganization: true,
            isAdmin: true,
            invitationIds: [5000, 6000],
          })
          .withParameters({ userId: 123 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const userMemberships = await userMembershipsRepository.findByUserId({ userId: 123 });

        expect(userMemberships).to.deepEqualInstance(expectedUserMemberships);
      });
    });
  });
});
