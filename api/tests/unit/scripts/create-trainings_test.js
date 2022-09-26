const { expect, catchErr } = require('../../test-helper');

const { prepareDataForInsert } = require('../../../scripts/create-trainings');

describe('Unit | Scripts | create-trainings.js', function () {
  describe('#prepareDataForInsert', function () {
    it('should trim title, link, type, duration and locale', function () {
      // given
      const data = [
        {
          title: '   Travail de groupe et collaboration entre les personnels   ',
          link: '   https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924   ',
          type: '   autoformation   ',
          duration: '   06:00:00   ',
          locale: '  fr-fr',
        },
        {
          title: '   Moodle : Partager et échanger ses ressources',
          link: '   https://tube-strasbourg.beta.education.fr/videos/watch/7df08eb6-603e-46a8-9be3-a34092fe7e68',
          type: '   webinaire ',
          duration: '01:00:00  ',
          locale: 'fr-fr ',
        },
      ];

      // when
      const result = prepareDataForInsert(data);

      // then
      expect(result).to.deep.equal([
        {
          title: 'Travail de groupe et collaboration entre les personnels',
          link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
          type: 'autoformation',
          duration: '06:00:00',
          locale: 'fr-fr',
        },
        {
          title: 'Moodle : Partager et échanger ses ressources',
          link: 'https://tube-strasbourg.beta.education.fr/videos/watch/7df08eb6-603e-46a8-9be3-a34092fe7e68',
          type: 'webinaire',
          duration: '01:00:00',
          locale: 'fr-fr',
        },
      ]);
    });

    it('should throw an error when type is not valid', async function () {
      // given
      const data = [
        {
          title: 'Travail de groupe et collaboration entre les personnels   ',
          link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924   ',
          type: 'autoformation',
          duration: '06:00:00',
          locale: 'fr-fr',
        },
        {
          title: 'Moodle : Partager et échanger ses ressources',
          link: 'https://tube-strasbourg.beta.education.fr/videos/watch/7df08eb6-603e-46a8-9be3-a34092fe7e68',
          type: 'test',
          duration: '01:00:00',
          locale: 'fr-fr',
        },
      ];

      // when
      const result = await catchErr(prepareDataForInsert)(data);

      // then
      expect(result).to.be.instanceOf(Error);
      expect(result.message).to.be.equal(
        'The type of training : "Moodle : Partager et échanger ses ressources" is invalid.'
      );
    });
  });
});
