const IMAGES_BASE_URL = 'https://assets.pix.org/modules/cookix';

export const cookixModule = {
  id: 'e98f3427-8c01-4f3a-9fa9-9a4253334990',
  shortId: 'cookix',
  slug: 'apprendre-a-faire-des-cookix',
  title: 'Apprendre à faire des cookix',
  visibility: 'private',
  details: {
    image: `${IMAGES_BASE_URL}/cover.jpg`,
    description:
      '<p>Ce module factice vous apprend à préparer des cookix au chocolat noir et aux noisettes.</p><p>Il sert de module de démonstration pour les tests internes à Pix.</p>',
    duration: 10,
    level: 'novice',
    tabletSupport: 'comfortable',
    objectives: [
      'Connaître les ingrédients des cookix',
      'Suivre les étapes de préparation',
      'Réussir la congélation et la cuisson des cookix',
    ],
  },
  glossary: [
    {
      words: ['cookix'],
      definition: 'Biscuit moelleux à cœur et croustillant sur les bords, garni de chocolat.',
    },
    {
      words: ['torréfier', 'torréfiées'],
      definition: 'Griller à sec au four pour développer les arômes, ici ceux des noisettes.',
    },
    {
      words: ['quinconce'],
      definition: 'Disposition en décalé d’une rangée à l’autre, qui laisse de la place à chaque cookix pour s’étaler.',
    },
  ],
  version: '1.0',
  sections: [
    {
      id: 'aa445576-e147-4252-a5b7-ebd6b007456b',
      type: 'question-yourself',
      grains: [
        {
          id: '9216512f-9410-4ef9-b316-92e1f29290e0',
          type: 'discovery',
          title: 'Avant de mettre la main à la pâte',
          components: [
            {
              type: 'element',
              element: {
                id: '8fd0be3f-8c6a-4321-a768-cd446abe211a',
                type: 'qcu-declarative',
                instruction: '<p>Selon vous, quel est le secret d’un bon cookix&nbsp;?</p>',
                proposals: [
                  {
                    id: '1',
                    content: 'Beaucoup de chocolat',
                    feedback: {
                      diagnosis:
                        '<p>Le chocolat noir est la star, mais il n’est pas seul&nbsp;: les noisettes lui donnent du croquant.</p>',
                    },
                  },
                  {
                    id: '2',
                    content: 'Une nuit au congélateur',
                    feedback: {
                      diagnosis:
                        '<p>Bien vu&nbsp;! Congelée, la pâte s’étale moins à la cuisson et le cœur reste moelleux.</p>',
                    },
                  },
                  {
                    id: '3',
                    content: 'Une pincée de fleur de sel',
                    feedback: {
                      diagnosis: '<p>Une pincée suffit, mais elle relève vraiment le chocolat.</p>',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'c3ab0c92-022f-41ec-9be6-494c2ad2d987',
      type: 'explore-to-understand',
      grains: [
        {
          id: '18a1486b-70a6-4a0c-85c9-2cd21de8647e',
          type: 'lesson',
          title: 'Les ingrédients',
          components: [
            {
              type: 'element',
              element: {
                id: '4943693b-76bc-4734-965c-5320d51c2b3e',
                type: 'text',
                tag: ' ',
                content:
                  '<p>Première étape de la decookixellisation&nbsp;: réunir les ingrédients.</p><p>Pour 24 cookix de 30&nbsp;g, il vous faut&nbsp;:</p><ul><li>50 g de noisettes</li><li>130 g de cassonade</li><li>1 bonne pincée de vanille en poudre</li><li>125 g de beurre demi-sel fondu</li><li>1 œuf</li><li>230 g de farine</li><li>1 pincée de fleur de sel</li><li>50 g de beurre de noisette (purée de noisettes)</li><li>100 g de chocolat noir</li></ul><p>Comptez 10 minutes de préparation, 1 nuit de congélation et 30 minutes de cuisson.</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: 'a85e05a1-5283-4936-9df7-3f575cd7f89e',
                type: 'text',
                tag: 'did-you-know',
                content:
                  '<p>La cassonade est un sucre roux de canne&nbsp;: elle donne aux cookix leur goût légèrement caramélisé et leur moelleux.</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: '2f7eaf21-6131-4697-a034-f6a339b147e3',
                type: 'image',
                url: `${IMAGES_BASE_URL}/boite-matcha-verticale.jpg`,
                alt: 'Boîte en métal remplie de cookix au matcha et aux trois chocolats, à côté de son couvercle étiqueté « cookix »',
                alternativeText: '',
                maxWidth: 300,
              },
            },
          ],
        },
        {
          id: '3cca7b6f-d0e7-49fa-9403-fc00a1c6cc6c',
          type: 'short-lesson',
          title: 'La préparation pas à pas',
          components: [
            {
              type: 'stepper',
              steps: [
                {
                  elements: [
                    {
                      id: 'faa5cc15-1ef7-424b-9063-b8453ca2fa8f',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>1. Faites torréfier les noisettes 15 minutes au four à 160&nbsp;°C, jusqu’à ce qu’elles soient grillées à cœur. 🌰</p>',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: '37fea350-5835-4792-98e1-8a67914aec0f',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>2. Fouettez la cassonade, la vanille et le beurre fondu jusqu’à obtenir une texture crémeuse, puis ajoutez l’œuf sans cesser de fouetter. 🥚</p>',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'f79f9f7d-c015-4cc8-9532-0133c41f67ef',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>3. Versez d’un coup la farine et le sel, mélangez, puis ajoutez le beurre de noisette. Terminez à la main avec le chocolat haché et les noisettes concassées. 🍫</p>',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: 'cb35a56d-1dbb-45b2-a40d-d91bfe8a31e4',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>4. Formez des boules d’environ 30&nbsp;g, disposez-les en quinconce sur une plaque recouverte de papier cuisson, aplatissez-les, filmez et placez une nuit au congélateur. ❄️</p>',
                    },
                    {
                      id: '13101d02-9985-428e-bc71-1c907754b806',
                      type: 'image',
                      url: `${IMAGES_BASE_URL}/boules-de-pate.jpg`,
                      alt: 'Une vingtaine de boules de pâte à cookix crue alignées dans un plat',
                      alternativeText: '',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: '2b948f34-6215-4257-9fab-54f418c88236',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>5. Le lendemain, enfournez à 200&nbsp;°C en chaleur statique pendant 12 à 15 minutes, jusqu’à ce que la surface colore légèrement. ⏲️</p>',
                    },
                    {
                      id: 'f0e887b2-8718-4682-b905-5cfba5462472',
                      type: 'image',
                      url: `${IMAGES_BASE_URL}/cuisson-four.jpg`,
                      alt: 'Cookix en train de cuire sur une plaque dans un four',
                      alternativeText: '',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: '34a6a527-3bb9-41f7-9f65-7780d46664b1',
                      type: 'text',
                      tag: ' ',
                      content:
                        '<p>6. Laissez-les refroidir à la sortie du four&nbsp;: ils durcissent en refroidissant. 🍪</p>',
                    },
                    {
                      id: '2c20a03e-841f-4ec6-a757-b1b80b75c26e',
                      type: 'image',
                      url: `${IMAGES_BASE_URL}/sortie-du-four.jpg`,
                      alt: 'Plaque de seize cookix dorés aux pépites de chocolat, tout juste sortis du four',
                      alternativeText: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '6a822be2-2c67-4de7-8aab-dc0bc0b7aea0',
      type: 'practise',
      grains: [
        {
          id: 'a5789907-29c8-40d4-ad89-45352aa15e1b',
          type: 'activity',
          title: 'La cuisson',
          components: [
            {
              type: 'element',
              element: {
                id: 'd26a3432-ac8e-4d3b-ac09-163ab1da31fa',
                type: 'qcu',
                instruction: '<p>À quelle température faut-il cuire les cookix&nbsp;?</p>',
                solution: '2',
                proposals: [
                  {
                    id: '1',
                    content: '160 °C',
                    feedback: {
                      state: 'Incorrect.',
                      diagnosis:
                        '<p>160&nbsp;°C, c’est pour torréfier les noisettes. Les cookix cuisent plus chaud.</p>',
                    },
                  },
                  {
                    id: '2',
                    content: '200 °C',
                    feedback: {
                      state: 'Correct&#8239;!',
                      diagnosis:
                        '<p>À 200&nbsp;°C en chaleur statique, la surface colore et le cœur reste moelleux.</p>',
                    },
                  },
                  {
                    id: '3',
                    content: '250 °C',
                    feedback: {
                      state: 'Incorrect.',
                      diagnosis: '<p>Trop chaud&nbsp;: l’extérieur brûlerait avant que l’intérieur cuise.</p>',
                    },
                  },
                ],
                hasShortProposals: true,
              },
            },
          ],
        },
        {
          id: '3f73a783-cb3a-4f9d-9a2a-e317b636098a',
          type: 'activity',
          title: 'Les bons ingrédients',
          components: [
            {
              type: 'element',
              element: {
                id: '4f3afe1f-3d99-4d27-a05d-421460accfec',
                type: 'qcm',
                instruction: '<p>Quels ingrédients entrent dans la recette des cookix&nbsp;?</p>',
                proposals: [
                  { id: '1', content: 'Cassonade' },
                  { id: '2', content: 'Moutarde' },
                  { id: '3', content: 'Beurre de noisette' },
                  { id: '4', content: 'Chocolat noir' },
                  { id: '5', content: 'Cornichons' },
                ],
                solutions: ['1', '3', '4'],
                feedbacks: {
                  valid: {
                    state: 'Correct !',
                    diagnosis: '<p>Vous êtes prêt à pâtisser&nbsp;!</p>',
                  },
                  invalid: {
                    state: 'Et non !',
                    diagnosis: '<p>Ni moutarde ni cornichons dans les cookix, promis.</p>',
                  },
                },
                hasShortProposals: true,
              },
            },
          ],
        },
        {
          id: 'c855dc0b-c2e7-43df-8c08-761abb337029',
          type: 'activity',
          title: 'Le poids des boules',
          components: [
            {
              type: 'element',
              element: {
                id: '66a4c997-11b5-471e-b8a4-15d793a4849f',
                type: 'qrocm',
                instruction: '<p>Complétez la phrase suivante&nbsp;:</p>',
                proposals: [
                  {
                    type: 'text',
                    content: '<p>Chaque boule de pâte pèse environ</p>',
                  },
                  {
                    type: 'input',
                    input: 'cookix-poids',
                    inputType: 'number',
                    display: 'inline',
                    size: 3,
                    ariaLabel: 'Poids en grammes',
                    placeholder: '',
                    solutions: [30],
                    tolerances: [],
                  },
                  {
                    type: 'text',
                    content: '<p>grammes, ce qui donne 24 cookix.</p>',
                  },
                ],
                feedbacks: {
                  valid: {
                    state: 'Correct !',
                    diagnosis: '<p>30&nbsp;g par boule, pour des cookix tous de la même taille.</p>',
                  },
                  invalid: {
                    state: 'Incorrect !',
                    diagnosis: '<p>Il faut compter environ 30&nbsp;g par boule.</p>',
                  },
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: '108e1a84-aee5-4af9-8e0c-303e3c479931',
      type: 'retain-the-essentials',
      grains: [
        {
          id: 'ce1e0d9b-be9e-4242-b441-6d6d0c391eb8',
          type: 'summary',
          title: 'Les cookix en flashcards',
          components: [
            {
              type: 'element',
              element: {
                id: '390ca305-969b-4f75-9af0-84e3f5649fb3',
                type: 'flashcards',
                title: 'Mémo cookix',
                instruction: '<p>Retournez les cartes pour réviser la recette.</p>',
                introImage: {
                  url: `${IMAGES_BASE_URL}/matcha-trois-chocolats.jpg`,
                },
                cards: [
                  {
                    id: 'ecf2d299-d064-4a9c-b76f-e8294ccd3403',
                    recto: { text: 'Que faire des noisettes avant de les ajouter ?' },
                    verso: { text: '<p>Les torréfier 15 minutes à 160&nbsp;°C, puis les concasser.</p>' },
                  },
                  {
                    id: 'f5e6e2e3-79c2-4b8a-8b83-52bdc5916699',
                    recto: { text: 'Combien de temps les boules passent-elles au congélateur ?' },
                    verso: { text: '<p>Une nuit</p>' },
                  },
                  {
                    id: '08f4570f-1a2d-4450-8930-e64493cf6176',
                    recto: { text: 'À quelle température et combien de temps cuire les cookix ?' },
                    verso: { text: '<p>200&nbsp;°C en chaleur statique, 12 à 15 minutes</p>' },
                  },
                  {
                    id: '53ce45ce-a5ab-4978-968b-1a6b1a5effca',
                    recto: { text: 'Pourquoi laisser refroidir les cookix ?' },
                    verso: { text: '<p>Ils durcissent en refroidissant.</p>' },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 'bfddb318-7da6-4f9a-a960-8e0c94351aa1',
      type: 'go-further',
      grains: [
        {
          id: '99b71b63-2d60-48a0-8c5f-bd56b3df0dcc',
          type: 'lesson',
          title: 'Variantes gourmandes',
          components: [
            {
              type: 'element',
              element: {
                id: '2e1d7c4a-5b3f-4a8e-9c6d-1f0a2b3c4d5e',
                type: 'text',
                tag: 'tip',
                content: '<p>Une fois la recette maîtrisée, variez les plaisirs&nbsp;: matcha, épices, courge… 😋</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: '249cd73f-247c-4625-9001-bd655bcb0a73',
                type: 'image',
                url: `${IMAGES_BASE_URL}/variante-matcha.jpg`,
                alt: 'Assiette de cookix verts au matcha et pépites de chocolat blanc',
                alternativeText: '',
                legend: 'Cookix matcha et chocolat blanc',
              },
            },
            {
              type: 'element',
              element: {
                id: 'b41c471e-ed2b-4f2b-91ea-cecf56f2bb8c',
                type: 'image',
                url: `${IMAGES_BASE_URL}/variante-spooky.jpg`,
                alt: 'Un cookix posé sur une boîte, avec une étiquette manuscrite « Spooky Cookies : courge, chocolat, épices »',
                alternativeText: '',
                legend: 'Spooky cookix : courge, chocolat et épices',
              },
            },
            {
              type: 'element',
              element: {
                id: '73c34943-03ef-4415-a672-0429a9c3a932',
                type: 'image',
                url: `${IMAGES_BASE_URL}/variante-belle-epoque.jpg`,
                alt: 'Un cookix aux gros morceaux de chocolat posé sur une boîte, avec une étiquette « Cookies Belle Époque : noisettes, cannelle, gingembre »',
                alternativeText: '',
                legend: 'Cookix Belle Époque : noisettes, cannelle et gingembre',
              },
            },
          ],
        },
      ],
    },
  ],
};
