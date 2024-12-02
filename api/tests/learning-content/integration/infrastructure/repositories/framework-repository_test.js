import { frameworkRepository } from '../../../../../src/learning-content/infrastructure/repositories/framework-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Framework', function () {
  afterEach(async function () {
    await knex('learningcontent.frameworks').truncate();
  });

  describe('#saveMany', function () {
    it('should insert frameworks', async function () {
      // given
      const frameworkDtos = [
        { id: 'frameworkPix', name: 'Pix' },
        { id: 'frameworkJunior', name: 'Pix Junior' },
        { id: 'frameworkDroit', name: 'Pix+ Droit' },
        { id: 'frameworkRocket', name: 'Pix+ Rocket League' },
      ];

      // when
      await frameworkRepository.saveMany(frameworkDtos);

      // then
      const savedFrameworks = await knex.select('*').from('learningcontent.frameworks').orderBy('name');

      expect(savedFrameworks).to.deep.equal([
        { id: 'frameworkPix', name: 'Pix' },
        { id: 'frameworkJunior', name: 'Pix Junior' },
        { id: 'frameworkDroit', name: 'Pix+ Droit' },
        { id: 'frameworkRocket', name: 'Pix+ Rocket League' },
      ]);
    });

    describe('when some frameworks already exist', function () {
      it('should upsert frameworks and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkPix', name: 'Pix' });
        databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkJunior', name: 'Pix 1D' });
        databaseBuilder.factory.learningContent.buildFramework({
          id: 'frameworkDinosaures',
          name: 'Pix+ Dinosaures',
        });
        await databaseBuilder.commit();

        const frameworkDtos = [
          { id: 'frameworkPix', name: 'Pix' },
          { id: 'frameworkJunior', name: 'Pix Junior' },
          { id: 'frameworkDroit', name: 'Pix+ Droit' },
          { id: 'frameworkRocket', name: 'Pix+ Rocket League' },
        ];

        // when
        await frameworkRepository.saveMany(frameworkDtos);

        // then
        const savedFrameworks = await knex.select('*').from('learningcontent.frameworks').orderBy('name');

        expect(savedFrameworks).to.deep.equal([
          { id: 'frameworkPix', name: 'Pix' },
          { id: 'frameworkJunior', name: 'Pix Junior' },
          { id: 'frameworkDinosaures', name: 'Pix+ Dinosaures' },
          { id: 'frameworkDroit', name: 'Pix+ Droit' },
          { id: 'frameworkRocket', name: 'Pix+ Rocket League' },
        ]);
      });
    });
  });
});
