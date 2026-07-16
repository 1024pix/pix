import { moduleRepository } from '../../../../../src/learning-content/infrastructure/repositories/module-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Learning Content | Unit | Repositories | module-repository', function () {
  describe('#toDto', function () {
    it('maps module data for database storage', async function () {
      // given
      const module = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: '6a68bf32',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        visibility: 'private',
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description:
            "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
          duration: 5,
          level: 'novice',
          objectives: ['Non régression fonctionnelle'],
          tabletSupport: 'inconvenient',
        },
        sections: ['Première section', 'Deuxième section'],
        glossary: [
          {
            word: 'chat',
            definition:
              '<p>Le chat, plus spécifiquement désigné sous le nom de chat domestique, est une espèce de mammifères de l’Ordre des Carnivores, de la famille des félins (Félidés).</p>',
          },
        ],
        version: '3.6',
      };

      // when
      const dto = moduleRepository.toDto(module);

      // then
      expect(dto).to.deep.equal({
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: '6a68bf32',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        visibility: 'private',
        image: 'https://assets.pix.org/modules/placeholder-details.svg',
        description:
          "<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement l'intégralité des fonctionnalités disponibles à date.</p>",
        duration: 5,
        level: 'novice',
        objectives: ['Non régression fonctionnelle'],
        tabletSupport: 'inconvenient',
        sections: '["Première section","Deuxième section"]',
        glossary:
          '[{"word":"chat","definition":"<p>Le chat, plus spécifiquement désigné sous le nom de chat domestique, est une espèce de mammifères de l’Ordre des Carnivores, de la famille des félins (Félidés).</p>"}]',
        version: '3.6',
      });
    });
  });
});
