import { LearningContentResourceNotFound } from '../../../../shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';

const moduleDatasource = {
  getBySlug: async (slug) => {
    const availableModules = await Promise.resolve({
      'les-adresses-mail': {
        id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
        slug: 'les-adresses-mail',
        title: 'Les adresses mail',
        list: [
          {
            id: 'c1f3c8c7-6d5c-4c6c-9c4d-1a3d8f7e9f5d',
            content: [
              `<p><strong>L’identifiant</strong> est la première partie de l’adresse mail. Il a été choisi par Mickaël.</p>`,
              `<p>Tous les identifiants sont possibles, ou presque. Même avec des majuscules !</p>`,
              `<p>Par exemple : mika671 ou G3oDu671</p>`,
              `<p>Des caractères sont interdits : &, @, $, *, €, £, …</p>`,
            ].join(''),
          },
          {
            id: 'd9e8a7b6-5c4d-3e2f-1a0b-9f8e7d6c5b4a',
            content: [
              `<p><strong>L’arobase</strong> est dans toutes les adresses mails. Il sépare l’identifiant et le fournisseur d’adresse mail.</p>`,
              `<p>En anglais, ce symbole se lit “at” qui veut dire “chez”.</p>`,
              `<p> Le saviez-vous : c’est un symbole qui était utilisé bien avant l’informatique ! Par exemple, pour compter des quantités.</p>`,
            ].join(''),
          },
          {
            id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
            content: [
              `<p><strong>Le fournisseur d’adresse mail</strong> est la deuxième partie de l’adresse mail.</p>`,
              `<p>Cette partie de l’adresse est donnée par le fournisseur.</p>`,
              `<p>Des exemples de fournisseurs d’adresses mail : <ul><li>La Poste (laposte.net)</li><li>Google (gmail.com)</li><li>Yahoo (yahoo.com)</li><li>Microsoft (hotmail.com, live.fr)</li></ul></p>`,
              `<p>L’avez-vous remarqué ? Cette partie est en 2 morceaux : le nom du fournisseur (par exemple “laposte”) et une extension (dans notre exemple, “.net”).</p>`,
            ].join(''),
          },
        ],
      },
    });

    if (availableModules[slug] === undefined) {
      throw new LearningContentResourceNotFound();
    }

    return availableModules[slug];
  },
};

export default moduleDatasource;
