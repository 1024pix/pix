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
          .addMembership({ certificationCenterId: 1 })
          .addMembership({ certificationCenterId: 2, isDisabled: true })
          .addMembership({ certificationCenterId: 3, isDisabled: true })
          .withParameters({ userId: 123 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const userMemberships = await userMembershipsRepository.findByUserId({ userId: 123 });

        expect(userMemberships).to.deepEqualInstance(expectedUserMemberships);
      });
    });
  });
});
