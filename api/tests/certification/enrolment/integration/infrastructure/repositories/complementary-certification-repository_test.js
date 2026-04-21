import { enrolmentRepositories } from '../../../../../../src/certification/enrolment/infrastructure/repositories/index.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Certification | Session | Repository | Complementary certification', function () {
  describe('#findAll', function () {
    describe('when there are complementary certifications', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'EDU_1ER_DEGRE',
          label: 'Pix+ Édu 1er degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 3,
          key: 'DROIT',
          label: 'Pix+ Droit',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 4,
          key: 'CLEA',
          label: 'CléA Numérique',
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await enrolmentRepositories.complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.certification.shared.buildComplementaryCertification({
            id: 1,
            key: 'EDU_1ER_DEGRE',
            label: 'Pix+ Édu 1er degré',
          }),
          domainBuilder.certification.shared.buildComplementaryCertification({
            id: 2,
            key: 'EDU_2ND_DEGRE',
            label: 'Pix+ Édu 2nd degré',
          }),
          domainBuilder.certification.shared.buildComplementaryCertification({
            id: 3,
            key: 'DROIT',
            label: 'Pix+ Droit',
          }),
          domainBuilder.certification.shared.buildComplementaryCertification({
            id: 4,
            key: 'CLEA',
            label: 'CléA Numérique',
          }),
        ];

        expect(complementaryCertifications).to.deepEqualArray(expectedComplementaryCertifications);
      });
    });

    describe('when there are no complementary certification', function () {
      it('should return an empty array', async function () {
        // given when
        const complementaryCertifications = await enrolmentRepositories.complementaryCertificationRepository.findAll();

        // then
        expect(complementaryCertifications).to.be.empty;
      });
    });
  });
});
