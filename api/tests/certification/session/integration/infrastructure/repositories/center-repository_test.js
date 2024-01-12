import { databaseBuilder, domainBuilder, expect, catchErr } from '../../../../../test-helper.js';
import * as centerRepository from '../../../../../../src/certification/session/infrastructure/repositories/center-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

describe('Integration | Certification |  Center | Repository | center-repository', function () {
  describe('#getById', function () {
    context('the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const unknownCertificationCenterId = 1;
        const error = await catchErr(centerRepository.getById)({ id: unknownCertificationCenterId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal(`Certification center not found`);
      });
    });

    it('should return the certification center by its id', async function () {
      // given
      const certificationCenterId = 1;
      databaseBuilder.factory.buildCertificationCenter({
        id: certificationCenterId,
        type: 'SCO',
      });
      const cleaId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      const droitId = databaseBuilder.factory.buildComplementaryCertification.droit({}).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: cleaId,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: droitId,
      });
      await databaseBuilder.commit();

      // when
      const result = await centerRepository.getById({
        id: certificationCenterId,
      });

      // then
      const expectedCenter = domainBuilder.certification.session.buildCenter({
        id: certificationCenterId,
        type: 'SCO',
        habilitations: [cleaId, droitId],
      });
      expect(result).to.deep.equal(expectedCenter);
    });
  });
});
