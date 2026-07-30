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

  describe('#isAdminOf', function () {
    it('returns false when user is not a member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123 })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOf(456)).to.be.false;
    });

    it('returns false when user used to be an admin of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, isDisabled: true })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOf(123)).to.be.false;
    });

    it('returns true when user used is an active admin member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, isDisabled: false })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOf(123)).to.be.true;
    });
  });

  describe('#isMemberOfScoManagingStudents', function () {
    it('returns false when user is not a member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isLinkedToScoManagingStudentsOrganization: true })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOfScoManagingStudents(456)).to.be.false;
    });

    it('returns false when user used to be a member of the certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({
          certificationCenterId: 123,
          isDisabled: true,
          isLinkedToScoManagingStudentsOrganization: true,
        })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOfScoManagingStudents(123)).to.be.false;
    });

    it('returns false when user used is not a member of a SCO is managing students related certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isLinkedToScoManagingStudentsOrganization: false })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOfScoManagingStudents(123)).to.be.false;
    });

    it('returns true when user used is a member of a SCO is managing students related certification center', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isLinkedToScoManagingStudentsOrganization: true })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isMemberOfScoManagingStudents(123)).to.be.true;
    });
  });

  describe('#isAdminOfPeer', function () {
    it('returns false when user is not a member of the same certification center as the given peer membership id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, peerMembershipIds: [100, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfPeer(300)).to.be.false;
    });

    it('returns false when user is not ADMIN in the same certification center as the given peer membership id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: false, peerMembershipIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfPeer(300)).to.be.false;
    });

    it('returns false when user used to an ADMIN in the same certification center as the given peer membership id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, isDisabled: true, peerMembershipIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfPeer(300)).to.be.false;
    });

    it('returns true when user is ADMIN in the same certification center as the given peer membership id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, peerMembershipIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfPeer(300)).to.be.true;
    });
  });

  describe('#isAdminOfInvitation', function () {
    it('returns false when user is not a member of the same certification center as the given invitation id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, invitationIds: [100, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfInvitation(300)).to.be.false;
    });

    it('returns false when user is not ADMIN in the same certification center as the given invitation id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: false, invitationIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfInvitation(300)).to.be.false;
    });

    it('returns false when user used to be an ADMIN in the same certification center as the given invitation id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, isDisabled: true, invitationIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfInvitation(300)).to.be.false;
    });

    it('returns true when user is ADMIN in the same certification center as the given invitation id', function () {
      const userMemberships = domainBuilder.certification.shared
        .userMembershipsBuilder()
        .addMembership({ certificationCenterId: 123, isAdmin: true, invitationIds: [300, 200] })
        .withParameters({ userId: 1 })
        .build();

      expect(userMemberships.isAdminOfInvitation(300)).to.be.true;
    });
  });
});
