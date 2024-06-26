import { CertificationCenter } from '../../../../../../lib/domain/models/CertificationCenter.js';
import * as centerRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification |  Center | Repository | center-repository', function () {
  describe('#getById', function () {
    context('when the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const unknownCenterId = 1;
        const error = await catchErr(centerRepository.getById)({ id: unknownCenterId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Center not found');
      });
    });

    context('when the certification center has no habilitations', function () {
      it('should return the certification center without habilitations', async function () {
        // given
        const centerId = 1;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          type: CertificationCenter.types.PRO,
        });
        await databaseBuilder.commit();

        // when
        const result = await centerRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
          id: centerId,
          name: 'some name',
          type: 'PRO',
          externalId: 'EX123',
          habilitations: [],
          features: [],
          isV3Pilot: false,
        });
        expect(result).to.deepEqualInstance(expectedCenter);
      });
    });

    context('when the certification center is a feature pilot', function () {
      it('should return the information', async function () {
        // given
        const centerId = 1;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          type: CertificationCenter.types.PRO,
        });
        const feature = databaseBuilder.factory.buildFeature({
          key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
        });
        databaseBuilder.factory.buildCertificationCenterFeature({
          certificationCenterId: centerId,
          featureId: feature.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await centerRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
          id: centerId,
          name: 'some name',
          type: 'PRO',
          externalId: 'EX123',
          habilitations: [],
          features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
          isV3Pilot: false,
        });
        expect(result).to.deepEqualInstance(expectedCenter);
      });
    });

    it('should return the certification center by its id', async function () {
      // given
      const centerId = 1;
      databaseBuilder.factory.buildCertificationCenter({
        id: centerId,
        type: CertificationCenter.types.SCO,
      });
      const clea = databaseBuilder.factory.buildComplementaryCertification.clea({});
      const droit = databaseBuilder.factory.buildComplementaryCertification.droit({});
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: clea.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: droit.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await centerRepository.getById({
        id: centerId,
      });

      // then
      const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
        id: centerId,
        name: 'some name',
        type: 'SCO',
        externalId: 'EX123',
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: clea.id,
            key: clea.key,
            label: clea.label,
          }),
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: droit.id,
            key: droit.key,
            label: droit.label,
          }),
        ],
        features: [],
        isV3Pilot: false,
      });
      expect(result).to.deepEqualInstance(expectedCenter);
    });
  });
});
