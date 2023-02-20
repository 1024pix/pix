import { expect, knex } from '../../test-helper';
import BookshelfCertificationCenter from '../../../lib/infrastructure/orm-models/CertificationCenter';
import { createScoCertificationCenters } from '../../../scripts/create-sco-certification-centers';

describe('Acceptance | Scripts | create-sco-certification-centers.js', function () {
  describe('#createScoCertificationCenters', function () {
    const getNumberOfCertificationCenters = () => {
      return BookshelfCertificationCenter.count().then((number) => parseInt(number, 10));
    };

    afterEach(async function () {
      await knex('certification-centers').delete();
    });

    it('should insert 2 sco certification centers', async function () {
      // given
      const certificationCenters = [
        { name: 'Collège Victor Hugo', externalId: '1234567A', type: 'SCO' },
        { name: 'Lycée Marie Curie', externalId: '0123456B', type: 'SCO' },
      ];
      const numberbefore = await getNumberOfCertificationCenters();

      // when
      await createScoCertificationCenters(certificationCenters);
      const numberAfter = await getNumberOfCertificationCenters();

      // then
      expect(numberAfter - numberbefore).to.equal(2);
    });
  });
});
