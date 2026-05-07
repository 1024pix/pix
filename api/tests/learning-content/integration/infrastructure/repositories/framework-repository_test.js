import { frameworkRepository } from '../../../../../src/learning-content/infrastructure/repositories/framework-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Learning Content | Integration | Repositories | Framework', function () {
  describe('reading', function () {
    const frameworkData0 = {
      id: 'recId0',
      name: 'mon framework 0',
    };
    const frameworkData1 = {
      id: 'recId1',
      name: 'mon framework 1',
    };
    const frameworkData2 = {
      id: 'recId2',
      name: 'mon framework 2',
    };

    beforeEach(async function () {
      databaseBuilder.factory.learningContent.build({
        frameworks: [frameworkData0, frameworkData2, frameworkData1],
      });
      await databaseBuilder.commit();
    });

    describe('#list', function () {
      it('returns all frameworks', async function () {
        // when
        const frameworks = await frameworkRepository.list();

        // then
        const expectedFramework0 = domainBuilder.learningContent.buildFramework(frameworkData0);
        const expectedFramework1 = domainBuilder.learningContent.buildFramework(frameworkData1);
        const expectedFramework2 = domainBuilder.learningContent.buildFramework(frameworkData2);
        expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework1, expectedFramework2]);
      });

      it('returns an empty array when no frameworks in DB', async function () {
        // given
        await knex('learningcontent.frameworks').truncate();

        // when
        const frameworks = await frameworkRepository.list();

        // then
        expect(frameworks).to.deep.equal([]);
      });
    });

    describe('#getByName', function () {
      it('returns the framework framework', async function () {
        // given
        const expectedFramework = domainBuilder.learningContent.buildFramework(frameworkData1);

        // when
        const framework = await frameworkRepository.getByName(frameworkData1.name);

        // then
        expect(framework).to.deepEqualInstance(expectedFramework);
      });

      context('when framework is not found', function () {
        it('throws a NotFoundError', async function () {
          //given
          const frameworkName = 'frameworkData123';

          // when
          const error = await catchErr(frameworkRepository.getByName)(frameworkName);

          // then
          expect(error).to.be.an.instanceof(NotFoundError);
          expect(error.message).to.equal('Framework not found for name frameworkData123');
        });
      });
    });

    describe('#findByIds', function () {
      it('returns frameworks for ids ordered by name', async function () {
        // given
        const ids = [frameworkData2.id, frameworkData0.id];
        const expectedFramework0 = domainBuilder.learningContent.buildFramework(frameworkData0);
        const expectedFramework2 = domainBuilder.learningContent.buildFramework(frameworkData2);

        // when
        const frameworks = await frameworkRepository.findByIds(ids);

        // then
        expect(frameworks).to.deepEqualArray([expectedFramework0, expectedFramework2]);
      });

      it('returns frameworks it managed to find once', async function () {
        // given
        const ids = [frameworkData2.id, 'recIdCAVA', frameworkData2.id];
        const expectedFramework2 = domainBuilder.learningContent.buildFramework(frameworkData2);

        // when
        const frameworks = await frameworkRepository.findByIds(ids);

        // then
        expect(frameworks).to.deepEqualArray([expectedFramework2]);
      });

      it('should return an empty array when no frameworks found for ids', async function () {
        // given
        const ids = ['recIdCOUCOU', 'recIdCAVA'];

        // when
        const frameworks = await frameworkRepository.findByIds(ids);

        // then
        expect(frameworks).to.deepEqualArray([]);
      });
    });
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
