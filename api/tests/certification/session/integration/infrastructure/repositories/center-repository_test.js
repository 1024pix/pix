import { databaseBuilder, domainBuilder, expect, catchErr } from '../../../../../test-helper.js';
import * as centerRepository from '../../../../../../src/certification/session/infrastructure/repositories/center-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { CertificationCenter } from '../../../../../../lib/domain/models/CertificationCenter.js';

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
        const expectedCenter = domainBuilder.certification.session.buildCenter({
          id: centerId,
          type: 'PRO',
          habilitations: [],
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
      const cleaId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      const droitId = databaseBuilder.factory.buildComplementaryCertification.droit({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: cleaId,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: droitId,
      });
      await databaseBuilder.commit();

      // when
      const result = await centerRepository.getById({
        id: centerId,
      });

      // then
      const expectedCenter = domainBuilder.certification.session.buildCenter({
        id: centerId,
        type: 'SCO',
        habilitations: [cleaId, droitId],
      });
      expect(result).to.deepEqualInstance(expectedCenter);
    });
  });
});
