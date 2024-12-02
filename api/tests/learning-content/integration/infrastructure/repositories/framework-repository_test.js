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

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkIdB' });
      await databaseBuilder.commit();
    });

    it('should insert framework when it does not exist in DB', async function () {
      // given
      const frameworkDto = { id: 'frameworkPix', name: 'Pix' };

      // when
      await frameworkRepository.save(frameworkDto);

      // then
      const savedFramework = await knex
        .select('*')
        .from('learningcontent.frameworks')
        .where({ id: frameworkDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.frameworks').count();
      expect(count).to.equal(2);
      expect(savedFramework).to.deep.equal({ id: 'frameworkPix', name: 'Pix' });
    });

    it('should update framework when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({ id: 'frameworkPix', name: 'Pix' });
      await databaseBuilder.commit();
      const frameworkDto = { id: 'frameworkPix', name: 'Pax' };

      // when
      await frameworkRepository.save(frameworkDto);

      // then
      const savedFramework = await knex
        .select('*')
        .from('learningcontent.frameworks')
        .where({ id: frameworkDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.frameworks').count();
      expect(count).to.equal(2);
      expect(savedFramework).to.deep.equal({ id: 'frameworkPix', name: 'Pax' });
    });
  });
});
