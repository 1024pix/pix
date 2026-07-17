import sinon from 'sinon';

import { UnableToAttachCertificationCenterToOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { DataProtectionOfficer } from '../../../../../src/organizational-entities/domain/models/DataProtectionOfficer.js';
import { createCertificationCenter } from '../../../../../src/organizational-entities/domain/usecases/create-certification-center.usecase.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Organizational Entities | Domain | UseCase | create-certification-center', function () {
  describe('#createCertificationCenter', function () {
    it('saves and returns the certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const complementaryCertificationHabilitationRepository = {};
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };

      // when
      const createdCertificationCenter = await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds: [],
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(certificationCenterForAdminRepository.save).to.be.calledOnceWith(certificationCenter);
      expect(createdCertificationCenter).to.deepEqualInstance(certificationCenter);
    });

    it('saves the complementary certification habilitations', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const complementaryCertificationIds = ['1234', '4567'];
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const complementaryCertificationHabilitationRepository = {
        save: sinon.stub(),
      };
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };

      // when
      await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds,
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(complementaryCertificationHabilitationRepository.save).to.be.calledTwice;
    });

    it('creates a data protection officer while saving and returning the certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const dataProtectionOfficer = {
        certificationCenterId: certificationCenter.id,
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
      };
      certificationCenter.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
      certificationCenter.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
      certificationCenter.dataProtectionOfficerEmail = dataProtectionOfficer.email;
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };
      const complementaryCertificationHabilitationRepository = {};

      // when
      await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds: [],
        certificationCenterForAdminRepository,
        dataProtectionOfficerRepository,
        complementaryCertificationHabilitationRepository,
      });

      // then
      expect(dataProtectionOfficerRepository.create).to.be.calledOnceWith(dataProtectionOfficer);
    });

    it('attaches the created certification center to the organization when an organizationId is given', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const organizationId = 456;
      const certificationCenterForAdminRepository = {
        save: sinon.stub().returns(certificationCenter),
        findAttachedByOrganizationId: sinon.stub().resolves([]),
      };
      const complementaryCertificationHabilitationRepository = {};
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };
      const organizationForAdminRepository = {
        exist: sinon.stub().resolves(true),
        attachCertificationCenter: sinon.stub().resolves(),
      };

      // when
      await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds: [],
        organizationId,
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
        organizationForAdminRepository,
      });

      // then
      expect(organizationForAdminRepository.attachCertificationCenter).to.be.calledOnceWith({
        organizationId,
        certificationCenterId: certificationCenter.id,
      });
    });

    it('throws when the given organizationId does not match an existing organization', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const organizationId = 456;
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const complementaryCertificationHabilitationRepository = {};
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };
      const organizationForAdminRepository = { exist: sinon.stub().resolves(false) };

      // when
      const error = await catchErr(createCertificationCenter)({
        certificationCenter,
        complementaryCertificationIds: [],
        organizationId,
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
      expect(error.code).to.equal('ORGANIZATION_NOT_FOUND');
    });

    it('throws when the organization already has an attached certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const organizationId = 456;
      const certificationCenterForAdminRepository = {
        save: sinon.stub().returns(certificationCenter),
        findAttachedByOrganizationId: sinon.stub().resolves([{ id: 789 }]),
      };
      const complementaryCertificationHabilitationRepository = {};
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          }),
        ),
      };
      const organizationForAdminRepository = { exist: sinon.stub().resolves(true) };

      // when
      const error = await catchErr(createCertificationCenter)({
        certificationCenter,
        complementaryCertificationIds: [],
        organizationId,
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
      expect(error.code).to.equal('ALREADY_ATTACHED_ORGANIZATION');
    });
  });
});
