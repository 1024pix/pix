const {
  expect,
  databaseBuilder,
} = require('../../../../../../tests/test-helper');
const { CertificationCenter } = require('../../../../domain/models/CertificationCenter');
const certificationCenterRepository = require('../../../../infrastructure/repositories/certification-center-repository');

describe('Integration | Repositories | certificationCenter', () => {

  context('#get', () => {

    context('when certification center exists for given id', () => {

      it('returns the certification center', async () => {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 123,
          name: 'Chateau de versailles',
        });
        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.get(123);

        // then
        const expectedCertificationCenter = new CertificationCenter({ name: 'Chateau de versailles' });
        expect(certificationCenter).to.deep.equal(expectedCertificationCenter);
      });
    });

    context('when certification center does not exist', () => {

      it('returns null', async () => {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 123,
          name: 'Chateau de versailles',
        });
        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.get(456);

        // then
        expect(certificationCenter).to.be.null;
      });
    });
  });
});
