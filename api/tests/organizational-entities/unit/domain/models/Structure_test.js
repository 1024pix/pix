import { expect } from 'chai';

import { UnableToAttachCertificationCenterToOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Organizational Entities | Domain | Model | Structure', function () {
  describe('constructor', function () {
    it('should create a Structure with given attributes', function () {
      // when
      const structure = domainBuilder.acquisition.buildStructure({
        id: 1,
        organizationId: 2,
        certificationCenterId: 3,
      });

      // then
      expect(structure).to.deep.equal({ id: 1, organizationId: 2, certificationCenterId: 3 });
    });

    it('should default organizationId and certificationCenterId to null', function () {
      // when
      const structure = domainBuilder.acquisition.buildStructure({ id: 1 });

      // then
      expect(structure.organizationId).to.be.null;
      expect(structure.certificationCenterId).to.be.null;
    });
  });

  describe('#attachCertificationCenter', function () {
    context('when structure has no attached certification center', function () {
      context('when certification center has no structure', function () {
        it('should attach the certification center', function () {
          // given
          const structure = domainBuilder.acquisition.buildStructure({ id: 1, organizationId: 2 });

          // when
          structure.attachCertificationCenter({ certificationCenterId: 3 });

          // then
          expect(structure.certificationCenterId).to.equal(3);
        });
      });

      context('when certification center structure is not attached to an organization', function () {
        it('should attach the certification center', function () {
          // given
          const structure = domainBuilder.acquisition.buildStructure({ id: 1, organizationId: 2 });
          const certificationCenterStructure = domainBuilder.acquisition.buildStructure({
            id: 10,
            certificationCenterId: 3,
          });

          // when
          structure.attachCertificationCenter({ certificationCenterId: 3, certificationCenterStructure });

          // then
          expect(structure.certificationCenterId).to.equal(3);
        });
      });

      context('when certification center structure is already attached to an organization', function () {
        it('should throw an UnableToAttachCertificationCenterToOrganization error', function () {
          // given
          const structure = domainBuilder.acquisition.buildStructure({ id: 1, organizationId: 2 });
          const certificationCenterStructure = domainBuilder.acquisition.buildStructure({
            id: 10,
            organizationId: 99,
            certificationCenterId: 3,
          });

          // when
          const error = catchErrSync(
            structure.attachCertificationCenter,
            structure,
          )({
            certificationCenterId: 3,
            certificationCenterStructure,
          });

          // then
          expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
          expect(error.code).to.equal('ALREADY_ATTACHED_CERTIFICATION_CENTER');
          expect(error.message).to.equal(
            'Unable to attach a certification center already attached to another organization.',
          );
          expect(error.meta).to.deep.equal({
            organizationId: 2,
            certificationCenterId: 3,
            alreadyAttachedOrganizationId: 99,
          });
          expect(structure.certificationCenterId).to.be.null;
        });
      });
    });

    context('when structure already has an attached certification center', function () {
      it('should throw an UnableToAttachCertificationCenterToOrganization error', function () {
        // given
        const structure = domainBuilder.acquisition.buildStructure({
          id: 1,
          organizationId: 2,
          certificationCenterId: 4,
        });

        // when
        const error = catchErrSync(structure.attachCertificationCenter, structure)({ certificationCenterId: 3 });

        // then
        expect(error).to.be.instanceOf(UnableToAttachCertificationCenterToOrganization);
        expect(error.code).to.equal('ALREADY_ATTACHED_ORGANIZATION');
        expect(error.message).to.equal('Organization already has an attached certification center');
        expect(error.meta).to.deep.equal({
          organizationId: 2,
          alreadyAttachedCertificationCenterId: 4,
        });
        expect(structure.certificationCenterId).to.equal(4);
      });
    });
  });
});
