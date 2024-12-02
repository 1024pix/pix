import { tutorialRepository } from '../../../../../src/learning-content/infrastructure/repositories/tutorial-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Tutorial', function () {
  afterEach(async function () {
    await knex('learningcontent.tutorials').truncate();
  });

  describe('#saveMany', function () {
    it('should insert tutorials', async function () {
      // given
      const tutorialDtos = [
        {
          id: 'tutorialIdA',
          duration: 'duration Tutoriel A',
          format: 'format Tutoriel A',
          title: 'title Tutoriel A',
          source: 'source Tutoriel A',
          link: 'link Tutoriel A',
          locale: 'fr',
        },
        {
          id: 'tutorialIdB',
          duration: 'duration Tutoriel B',
          format: 'format Tutoriel B',
          title: 'title Tutoriel B',
          source: 'source Tutoriel B',
          link: 'link Tutoriel B',
          locale: 'en',
        },
        {
          id: 'tutorialIdC',
          duration: 'duration Tutoriel C',
          format: 'format Tutoriel C',
          title: 'title Tutoriel C',
          source: 'source Tutoriel C',
          link: 'link Tutoriel C',
          locale: 'nl',
        },
      ];

      // when
      await tutorialRepository.saveMany(tutorialDtos);

      // then
      const savedTutorials = await knex.select('*').from('learningcontent.tutorials').orderBy('id');

      expect(savedTutorials).to.deep.equal([
        {
          id: 'tutorialIdA',
          duration: 'duration Tutoriel A',
          format: 'format Tutoriel A',
          title: 'title Tutoriel A',
          source: 'source Tutoriel A',
          link: 'link Tutoriel A',
          locale: 'fr',
        },
        {
          id: 'tutorialIdB',
          duration: 'duration Tutoriel B',
          format: 'format Tutoriel B',
          title: 'title Tutoriel B',
          source: 'source Tutoriel B',
          link: 'link Tutoriel B',
          locale: 'en',
        },
        {
          id: 'tutorialIdC',
          duration: 'duration Tutoriel C',
          format: 'format Tutoriel C',
          title: 'title Tutoriel C',
          source: 'source Tutoriel C',
          link: 'link Tutoriel C',
          locale: 'nl',
        },
      ]);
    });

    describe('when some tutorials already exist', function () {
      it('should upsert tutorials and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildTutorial({
          id: 'tutorialIdA',
          duration: 'duration Tutoriel A',
          format: 'format Tutoriel A',
          title: 'title Tutoriel A',
          source: 'source Tutoriel A',
          link: 'link Tutoriel A',
          locale: 'fr',
        });
        databaseBuilder.factory.learningContent.buildTutorial({
          id: 'tutorialIdB',
          duration: 'duration Tutoriel B',
          format: 'format Tutoriel B',
          title: 'title Tutoriel B',
          source: 'source Tutoriel B',
          link: 'link Tutoriel B',
          locale: 'en',
        });
        await databaseBuilder.commit();

        const tutorialDtos = [
          {
            id: 'tutorialIdA',
            duration: 'duration Tutoriel A modified',
            format: 'format Tutoriel A modified',
            title: 'title Tutoriel A modified',
            source: 'source Tutoriel A modified',
            link: 'link Tutoriel A modified',
            locale: 'es',
          },
          {
            id: 'tutorialIdC',
            duration: 'duration Tutoriel C',
            format: 'format Tutoriel C',
            title: 'title Tutoriel C',
            source: 'source Tutoriel C',
            link: 'link Tutoriel C',
            locale: 'nl',
          },
        ];

        // when
        await tutorialRepository.saveMany(tutorialDtos);

        // then
        const savedTutorials = await knex.select('*').from('learningcontent.tutorials').orderBy('id');

        expect(savedTutorials).to.deep.equal([
          {
            id: 'tutorialIdA',
            duration: 'duration Tutoriel A modified',
            format: 'format Tutoriel A modified',
            title: 'title Tutoriel A modified',
            source: 'source Tutoriel A modified',
            link: 'link Tutoriel A modified',
            locale: 'es',
          },
          {
            id: 'tutorialIdB',
            duration: 'duration Tutoriel B',
            format: 'format Tutoriel B',
            title: 'title Tutoriel B',
            source: 'source Tutoriel B',
            link: 'link Tutoriel B',
            locale: 'en',
          },
          {
            id: 'tutorialIdC',
            duration: 'duration Tutoriel C',
            format: 'format Tutoriel C',
            title: 'title Tutoriel C',
            source: 'source Tutoriel C',
            link: 'link Tutoriel C',
            locale: 'nl',
          },
        ]);
      });
    });
  });

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildTutorial({ id: 'tutorialIdB' });
      await databaseBuilder.commit();
    });

    it('should insert tutorial when it does not exist in DB', async function () {
      // given
      const tutorialDto = {
        id: 'tutorialIdA',
        duration: 'duration Tutoriel A',
        format: 'format Tutoriel A',
        title: 'title Tutoriel A',
        source: 'source Tutoriel A',
        link: 'link Tutoriel A',
        locale: 'fr',
      };

      // when
      await tutorialRepository.save(tutorialDto);

      // then
      const savedTutorial = await knex
        .select('*')
        .from('learningcontent.tutorials')
        .where({ id: tutorialDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.tutorials').count();
      expect(count).to.equal(2);
      expect(savedTutorial).to.deep.equal({
        id: 'tutorialIdA',
        duration: 'duration Tutoriel A',
        format: 'format Tutoriel A',
        title: 'title Tutoriel A',
        source: 'source Tutoriel A',
        link: 'link Tutoriel A',
        locale: 'fr',
      });
    });

    it('should update tutorial when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildTutorial({
        id: 'tutorialIdA',
        duration: 'duration Tutoriel A',
        format: 'format Tutoriel A',
        title: 'title Tutoriel A',
        source: 'source Tutoriel A',
        link: 'link Tutoriel A',
        locale: 'fr',
      });
      await databaseBuilder.commit();
      const tutorialDto = {
        id: 'tutorialIdA',
        duration: 'duration Tutoriel A modified',
        format: 'format Tutoriel A modified',
        title: 'title Tutoriel A modified',
        source: 'source Tutoriel A modified',
        link: 'link Tutoriel A modified',
        locale: 'es',
      };

      // when
      await tutorialRepository.save(tutorialDto);

      // then
      const savedTutorial = await knex
        .select('*')
        .from('learningcontent.tutorials')
        .where({ id: tutorialDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.tutorials').count();
      expect(count).to.equal(2);
      expect(savedTutorial).to.deep.equal({
        id: 'tutorialIdA',
        duration: 'duration Tutoriel A modified',
        format: 'format Tutoriel A modified',
        title: 'title Tutoriel A modified',
        source: 'source Tutoriel A modified',
        link: 'link Tutoriel A modified',
        locale: 'es',
      });
    });
  });
});
