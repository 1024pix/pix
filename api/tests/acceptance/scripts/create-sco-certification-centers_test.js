const { expect } = require('../../test-helper');

const BookshelfCertificationCenter = require('../../../lib/infrastructure/data/certification-center');

const { createScoCertificationCenters } = require('../../../scripts/create-sco-certification-centers');

describe('Acceptance | Scripts | create-sco-certification-centers.js', () => {

  describe('#createScoCertificationCenters', () => {

    const getNumberOfCertificationCenters = () => {
      return BookshelfCertificationCenter.count()
        .then((number) => parseInt(number, 10));
    };

    it('should insert 2 sco certification centers', async () => {
      // given
      const certificationCenters = [
        { name: 'Collège Victor Hugo', externalId: '1234567A', type: 'SCO' },
        { name: 'Lycée Marie Curie', externalId: '0123456B', type: 'SCO' }
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
