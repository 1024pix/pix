import sinon from 'sinon';

import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import * as certificationCenterInvitationRepository from '../../../../../src/team/infrastructure/repositories/certification-center-invitation-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Team | Infrastructure | Repositories | CertificationCenterInvitationRepository', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2023-10-13');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#update', function () {
    it('updates invitation', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        role: 'MEMBER',
        locale: 'fr',
      });
      await databaseBuilder.commit();
      // when
      await certificationCenterInvitationRepository.update({
        ...invitation,
        role: 'ADMIN',
        locale: 'EN',
      });

      // then
      const updatedInvitation = await knex('certification-center-invitations').where({ id: invitation.id }).first();
      expect(updatedInvitation).to.deep.equal({
        id: invitation.id,
        email: invitation.email,
        code: invitation.code,
        role: 'ADMIN',
        locale: 'EN',
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
        createdAt: invitation.createdAt,
        updatedAt: now,
      });
      clock.restore();
    });
  });

  describe('#updateModificationDate', function () {
    it('updates the certification center invitation modification date', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10'),
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterInvitationRepository.updateModificationDate(certificationCenterInvitation.id);

      // then
      const updatedCertificationCenterInvitation = await knex('certification-center-invitations')
        .where({ id: certificationCenterInvitation.id })
        .first();
      expect(updatedCertificationCenterInvitation.updatedAt).to.deep.equal(now);
      clock.restore();
    });
  });

  describe('#deleteInvitationsByCertificationCenterId', function () {
    it('hard delete all invitations (all statuses included) of a given certification center', async function () {
      // given
      const pendingStatus = CertificationCenterInvitation.StatusType.PENDING;
      const cancelledStatus = CertificationCenterInvitation.StatusType.CANCELLED;
      const acceptedStatus = CertificationCenterInvitation.StatusType.ACCEPTED;

      const givenCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: givenCertificationCenterId,
        status: pendingStatus,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: givenCertificationCenterId,
        status: acceptedStatus,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: givenCertificationCenterId,
        status: cancelledStatus,
      });

      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: otherCertificationCenterId,
        status: pendingStatus,
      });

      await databaseBuilder.commit();

      // when
      const [{ count: beforeDeleteForThisCertificationCenterInvitationsCount }] = await knex(
        'certification-center-invitations',
      )
        .where({ certificationCenterId: givenCertificationCenterId })
        .count();

      await certificationCenterInvitationRepository.deleteInvitationsByCertificationCenterId({
        certificationCenterId: givenCertificationCenterId,
      });

      // then
      expect(beforeDeleteForThisCertificationCenterInvitationsCount).to.equal(3);

      const givenCenterInvitations = await knex('certification-center-invitations').where({
        certificationCenterId: givenCertificationCenterId,
      });

      expect(givenCenterInvitations).to.have.lengthOf(0);

      const otherCenterInvitation = await knex('certification-center-invitations')
        .where({
          certificationCenterId: otherCertificationCenterId,
        })
        .first();
      expect(otherCenterInvitation.status).to.equal(pendingStatus);
    });
  });

  describe('#findOnePendingByEmailAndCertificationCenterId', function () {
    it('returns null if no pending invitation exists for the given email and certification center id', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const email = 'toto@example.net';

      // when
      const result = await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
        email,
        certificationCenterId,
      });

      // then
      expect(result).to.be.null;
    });

    it('returns the pending invitation for the given email and certification center id', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const email = 'toto@example.net';
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();

      const expectedInvitation = domainBuilder.buildCertificationCenterInvitation({
        id: certificationCenterInvitation.id,
        certificationCenterId: certificationCenter.id,
        certificationCenterName: certificationCenter.name,
        status: CertificationCenterInvitation.StatusType.PENDING,
        ...certificationCenterInvitation,
      });

      // when
      const result = await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
        email,
        certificationCenterId: certificationCenter.id,
      });

      // then
      expect(result).to.deep.equal(expectedInvitation);
    });
  });

  describe('#findPendingByCertificationCenterId', function () {
    it('returns all pending invitations for a given certification center', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const invitation1 = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      const invitation2 = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.ACCEPTED,
      });
      await databaseBuilder.commit();
      // when
      const result = await certificationCenterInvitationRepository.findPendingByCertificationCenterId({
        certificationCenterId,
      });
      // then
      expect(result.map((i) => i.id)).to.have.members([invitation1.id, invitation2.id]);
    });
  });

  describe('#getByIdAndCode', function () {
    it('returns the invitation for the given id and code', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        code: 'CODE123',
      });
      await databaseBuilder.commit();

      // when
      const result = await certificationCenterInvitationRepository.getByIdAndCode({
        id: invitation.id,
        code: 'CODE123',
      });

      // then
      expect(result.id).to.equal(invitation.id);
      expect(result.status).to.equal(CertificationCenterInvitation.StatusType.PENDING);
      expect(result.certificationCenterId).to.equal(certificationCenter.id);
      expect(result.certificationCenterName).to.equal(certificationCenter.name);
    });

    it('throws NotFoundError if not found', async function () {
      await expect(
        certificationCenterInvitationRepository.getByIdAndCode({ id: 9999, code: 'nope' }),
      ).to.be.rejectedWith("L'invitation à ce centre de certification n'existe pas");
    });
  });

  describe('#get', function () {
    it('returns the invitation for the given id', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const result = await certificationCenterInvitationRepository.get(invitation.id);

      // then
      expect(result.id).to.equal(invitation.id);
    });

    it('throws NotFoundError if not found', async function () {
      await expect(certificationCenterInvitationRepository.get(9999)).to.be.rejectedWith(
        "L'invitation à ce centre de certification n'existe pas",
      );
    });
  });

  describe('#create', function () {
    it('creates a new invitation and returns it', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
      const invitation = domainBuilder.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        email: 'new@pix.fr',
        code: 'NEWCODE',
      });
      const invitationToCreate = CertificationCenterInvitation.create(invitation);

      // when
      const result = await certificationCenterInvitationRepository.create(invitationToCreate);

      // then
      expect(result.email).to.equal('new@pix.fr');
      expect(result.code).to.equal('NEWCODE');
      expect(result.certificationCenterId).to.equal(certificationCenter.id);
    });
  });

  describe('#markAsCancelled', function () {
    it('marks the invitation as cancelled', async function () {
      // given
      const invitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      const invitationToCancel = domainBuilder.buildCertificationCenterInvitation({ ...invitation });

      await databaseBuilder.commit();

      // when
      await certificationCenterInvitationRepository.markAsCancelled({ id: invitationToCancel.id });

      // then
      const result = await knex('certification-center-invitations').where({ id: invitationToCancel.id }).first();
      expect(result.status).to.equal(CertificationCenterInvitation.StatusType.CANCELLED);
    });

    it('throws NotFoundError if not found', async function () {
      await expect(certificationCenterInvitationRepository.markAsCancelled({ id: 9999 })).to.be.rejectedWith(
        'Certification center invitation of id 9999 is not found.',
      );
    });
  });
});
