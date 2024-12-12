import { tutorialRepository } from '../../../../../src/learning-content/infrastructure/repositories/tutorial-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Tutorial', function () {
  afterEach(async function () {
    await knex('learningcontent.tutorials').truncate();
  });

  describe('#save', function () {
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
      await tutorialRepository.save(tutorialDtos);

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
        await tutorialRepository.save(tutorialDtos);

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
});
