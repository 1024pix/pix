import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Shared | Unit | Domain | Read-Models | UserMemberships', function () {
  describe('#isMemberOf', function () {
    it('returns false when user is not a member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123 })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOf(456)).to.be.false;
    });

    it('returns false when user used to be a member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isDisabled: true })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOf(123)).to.be.false;
    });

    it('returns true when user used is an active member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isDisabled: false })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOf(123)).to.be.true;
    });
  });
});
