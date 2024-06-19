import { getElements, getElementsListAsCsv } from '../../../../scripts/modulix/get-elements-csv.js';
import { expect } from '../../../test-helper.js';

describe('Acceptance | Script | Get Elements as CSV', function () {
  const modulesListAsJs = [
    {
      id: '6282925d-4775-4bca-b513-4c3009ec5886',
      slug: 'didacticiel-modulix',
      title: 'Didacticiel Modulix',
      details: {
        image: 'https://images.pix.fr/modulix/placeholder-details.svg',
        description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
        duration: 5,
        level: 'Débutant',
        objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
      },
      transitionTexts: [
        {
          content:
            "<p>Bonjour et bienvenue dans ce didacticiel Modulix. Vous allez pouvoir facilement découvrir comment fonctionne ce nouveau produit Pix.<br>C'est partix&#8239;!</p>",
          grainId: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
        },
        {
          content:
            '<p>Chaque leçon a un objectif pédagogique précis.</p><p>Dans la prochaine leçon, nous vous proposons de découvrir Pix avec une courte vidéo&nbsp;<span aria-hidden="true">📺</span></p>',
          grainId: '73ac3644-7637-4cee-86d4-1a75f53f0b9c',
        },
        {
          content:
            '<p>Vous allez faire votre première activité. Les activités servent à vérifier que vous avez compris l\'essentiel des leçons.<br>Dans les activités Modulix, vous avez votre résultat immédiatement. À vous de jouer&nbsp;<span aria-hidden="true">🚀</span></p>',
          grainId: '533c69b8-a836-41be-8ffc-8d4636e31224',
        },
        {
          content:
            '<p>Vous l’aurez compris, on aime varier les plaisirs et proposer différents types d’activité, après le questionnaire à choix unique on vous laisse découvrir le QCM&#8239;!</p>',
          grainId: '0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c',
        },
        {
          content:
            '<p>Vous l\'avez peut-être remarqué&nbsp;: dans un module, vous pouvez voir tous les contenus en remontant la page&nbsp;<span aria-hidden="true">👆</span>️</p>',
          grainId: '2a77a10f-19a3-4544-80f9-8012dad6506a',
        },
        {
          content:
            '<p>Vous arrivez à la fin de ce didacticiel. Une dernière activité et vous serez prêt à explorer tous les modules que vous souhaitez&#8239;!<span aria-hidden="true">🌟</span>️ </p>',
          grainId: '7cf75e70-8749-4392-8081-f2c02badb0fb',
        },
      ],
      grains: [
        {
          id: '47cd065b-dbf2-4adc-b5c3-02fb69cb9ec2',
          type: 'activity',
          title: 'Test Stepper',
          components: [
            {
              type: 'stepper',
              steps: [
                {
                  elements: [
                    {
                      id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
                      type: 'text',
                      content: '<p>À la fin de cette vidéo, une question sera posée sur les compétences Pix.</p>',
                    },
                  ],
                },
                {
                  elements: [
                    {
                      id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
                      type: 'text',
                      content: '<p>À la fin de cette vidéo, une question sera posée sur les compétences Pix.</p>',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
          type: 'lesson',
          title: 'Voici une leçon',
          components: [
            {
              type: 'element',
              element: {
                id: '84726001-1665-457d-8f13-4a74dc4768ea',
                type: 'text',
                content:
                  '<h3>On commence avec les leçons.<br>Les leçons sont des textes, des images ou des vidéos. Les leçons sont là pour vous expliquer des concepts ou des méthodes.</h3>',
              },
            },
            {
              type: 'element',
              element: {
                id: 'a2372bf4-86a4-4ecc-a188-b51f4f98bca2',
                type: 'text',
                content:
                  '<p>Voici un texte de leçon. Parfois, il y a des émojis pour aider à la lecture&nbsp;<span aria-hidden="true">📚</span>️.<br>Et là, voici une image&#8239;!</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: '8d7687c8-4a02-4d7e-bf6c-693a6d481c78',
                type: 'image',
                url: 'https://images.pix.fr/modulix/didacticiel/ordi-spatial.svg',
                alt: "Dessin détaillé dans l'alternative textuelle",
                alternativeText: "Dessin d'un ordinateur dans un univers spatial.",
              },
            },
          ],
        },
        {
          id: '73ac3644-7637-4cee-86d4-1a75f53f0b9c',
          type: 'lesson',
          title: 'Vidéo de présentation de Pix',
          components: [
            {
              type: 'element',
              element: {
                id: '342183f7-af51-4e4e-ab4c-ebed1e195063',
                type: 'text',
                content: '<p>À la fin de cette vidéo, une question sera posée sur les compétences Pix.</p>',
              },
            },
            {
              type: 'element',
              element: {
                id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
                type: 'video',
                title: 'Vidéo de présentation de Pix',
                url: 'https://videos.pix.fr/modulix/didacticiel/presentation.mp4',
                subtitles: '',
                transcription:
                  '<p>Le numérique évolue en permanence, vos compétences aussi, pour travailler, communiquer et s\'informer, se déplacer, réaliser des démarches, un enjeu tout au long de la vie.</p><p>Sur <a href="https://pix.fr" target="blank">pix.fr</a>, testez-vous et cultivez vos compétences numériques.</p><p>Les tests Pix sont personnalisés, les questions s\'adaptent à votre niveau, réponse après réponse.</p><p>Évaluez vos connaissances et savoir-faire sur 16 compétences, dans 5 domaines, sur 5 niveaux de débutants à confirmer, avec des mises en situation ludiques, recherches en ligne, manipulation de fichiers et de données, culture numérique...</p><p>Allez à votre rythme, vous pouvez arrêter et reprendre quand vous le voulez.</p><p>Toutes les 5 questions, découvrez vos résultats et progressez grâce aux astuces et aux tutos.</p><p>En relevant les défis Pix, vous apprendrez de nouvelles choses et aurez envie d\'aller plus loin.</p><p>Vous pensez pouvoir faire mieux&#8239;?</p><p>Retentez les tests et améliorez votre score.</p><p>Faites reconnaître officiellement votre niveau en passant la certification Pix, reconnue par l\'État et le monde professionnel.</p><p>Pix&nbsp;: le service public en ligne pour évaluer, développer et certifier ses compétences numériques.</p>',
              },
            },
          ],
        },
        {
          id: '533c69b8-a836-41be-8ffc-8d4636e31224',
          type: 'activity',
          title: 'Voici un vrai-faux',
          components: [
            {
              type: 'element',
              element: {
                id: '71de6394-ff88-4de3-8834-a40057a50ff4',
                type: 'qcu',
                instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
                proposals: [
                  {
                    id: '1',
                    content: 'Vrai',
                  },
                  {
                    id: '2',
                    content: 'Faux',
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct&#8239;! Ces 16 compétences sont rangées dans 5 domaines.</p>',
                  invalid:
                    '<p>Incorrect. Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
                },
                solution: '1',
              },
            },
          ],
        },
        {
          id: '0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c',
          type: 'activity',
          title: 'Les 3 piliers de Pix',
          components: [
            {
              type: 'element',
              element: {
                id: '30701e93-1b4d-4da4-b018-fa756c07d53f',
                type: 'qcm',
                instruction: '<p>Quels sont les 3 piliers de Pix&#8239;?</p>',
                proposals: [
                  {
                    id: '1',
                    content: 'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique',
                  },
                  {
                    id: '2',
                    content: 'Développer son savoir-faire sur les jeux de type TPS',
                  },
                  {
                    id: '3',
                    content: 'Développer ses compétences numériques',
                  },
                  {
                    id: '4',
                    content: 'Certifier ses compétences Pix',
                  },
                  {
                    id: '5',
                    content: 'Evaluer ses compétences de logique et compréhension mathématique',
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct&#8239;! Vous nous avez bien cernés&nbsp;:)</p>',
                  invalid:
                    '<p>Et non&#8239;! Pix sert à évaluer, certifier et développer ses compétences numériques.</p>',
                },
                solutions: ['1', '3', '4'],
              },
            },
          ],
        },
        {
          id: '2a77a10f-19a3-4544-80f9-8012dad6506a',
          type: 'activity',
          title: 'Activité remonter dans la page',
          components: [
            {
              type: 'element',
              element: {
                id: '0a5e77e8-1c8e-4cb6-a41d-cf6ad7935447',
                type: 'qcu',
                instruction:
                  '<p>Remontez la page pour trouver le premier mot de ce module.<br>Quel est ce mot&#8239;?</p>',
                proposals: [
                  {
                    id: '1',
                    content: 'Bienvenue',
                  },
                  {
                    id: '2',
                    content: 'Bonjour',
                  },
                  {
                    id: '3',
                    content: 'Nous',
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct&#8239;! Vous avez bien remonté la page</p>',
                  invalid: '<p>Incorrect. Remonter la page pour retrouver le premier mot&#8239;!</p>',
                },
                solution: '2',
              },
            },
          ],
        },
        {
          id: '4ce2a31a-6584-4dae-87c6-d08b58d0f3b9',
          type: 'activity',
          title: 'Connaissez-vous bien Pix',
          components: [
            {
              type: 'element',
              element: {
                id: 'c23436d4-6261-49f1-b50d-13a547529c29',
                type: 'qrocm',
                instruction: '<p>Compléter le texte suivant :</p>',
                proposals: [
                  {
                    type: 'text',
                    content: '<span>Pix est un</span>',
                  },
                  {
                    input: 'pix-name',
                    type: 'input',
                    inputType: 'text',
                    size: 10,
                    display: 'inline',
                    placeholder: '',
                    ariaLabel: 'Mot à trouver',
                    defaultValue: '',
                    tolerances: ['t1', 't3'],
                    solutions: ['Groupement'],
                  },
                  {
                    type: 'text',
                    content: "<span>d'intérêt public qui a été créée en</span>",
                  },
                  {
                    input: 'pix-birth',
                    type: 'input',
                    inputType: 'text',
                    size: 10,
                    display: 'inline',
                    placeholder: '',
                    ariaLabel: 'Année à trouver',
                    defaultValue: '',
                    tolerances: [],
                    solutions: ['2016'],
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct&#8239;! vous nous connaissez bien&nbsp;<span aria-hidden="true">🎉</span></p>',
                  invalid: '<p>Incorrect&#8239;! vous y arriverez la prochaine fois&#8239;!</p>',
                },
              },
            },
          ],
        },
        {
          id: '7cf75e70-8749-4392-8081-f2c02badb0fb',
          type: 'activity',
          title: 'Le nom de ce produit',
          components: [
            {
              type: 'element',
              element: {
                id: '98c51fa7-03b7-49b1-8c5e-49341d35909c',
                type: 'qrocm',
                instruction: '<p>Quel est le nom de ce nouveau produit Pix&#8239;?</p>',
                proposals: [
                  {
                    input: 'nom-produit',
                    type: 'input',
                    inputType: 'text',
                    size: 10,
                    display: 'block',
                    placeholder: '',
                    ariaLabel: 'Nom de ce produit',
                    defaultValue: '',
                    tolerances: ['t1'],
                    solutions: ['Modulix'],
                  },
                ],
                feedbacks: {
                  valid: '<p>Correct&#8239;! vous êtes prêt à explorer&nbsp;<span aria-hidden="true">🎉</span></p>',
                  invalid: '<p>Incorrect&#8239;! vous y arriverez la prochaine fois&#8239;!</p>',
                },
              },
            },
          ],
        },
      ],
    },
  ];

  describe('#getElements', function () {
    it('should filter out elements that are not activities', async function () {
      // When
      const elementsListAsJs = await getElements(modulesListAsJs);

      // Then
      expect(elementsListAsJs).to.be.an('array');
      expect(
        elementsListAsJs.every((element) => ['text', 'video', 'image', 'qcm', 'qcu', 'qrocm'].includes(element.type)),
      ).to.be.true;
    });

    it('should add some meta info to elements', async function () {
      // When
      const elementsListAsJs = await getElements(modulesListAsJs);

      // Then
      expect(elementsListAsJs).to.be.an('array');
      expect(elementsListAsJs.every((element) => element.moduleSlug !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.elementPosition !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainPosition !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainId !== undefined)).to.be.true;
      expect(elementsListAsJs.every((element) => element.grainTitle !== undefined)).to.be.true;
    });
  });

  describe('#getElementsListAsCsv', function () {
    it(`should return elements list as CSV`, async function () {
      // When
      const elementsListAsCsv = await getElementsListAsCsv(modulesListAsJs);

      // Then
      expect(elementsListAsCsv).to.be.a('string');
      expect(elementsListAsCsv).to
        .equal(`\ufeff"ElementId"	"ElementType"	"ElementPosition"	"ElementGrainPosition"	"ElementGrainId"	"ElementGrainTitle"	"ElementModuleSlug"
"342183f7-af51-4e4e-ab4c-ebed1e195063"	"text"	1	1	"47cd065b-dbf2-4adc-b5c3-02fb69cb9ec2"	"Test Stepper"	"didacticiel-modulix"
"342183f7-af51-4e4e-ab4c-ebed1e195063"	"text"	2	1	"47cd065b-dbf2-4adc-b5c3-02fb69cb9ec2"	"Test Stepper"	"didacticiel-modulix"
"84726001-1665-457d-8f13-4a74dc4768ea"	"text"	3	2	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"a2372bf4-86a4-4ecc-a188-b51f4f98bca2"	"text"	4	2	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"8d7687c8-4a02-4d7e-bf6c-693a6d481c78"	"image"	5	2	"f312c33d-e7c9-4a69-9ba0-913957b8f7dd"	"Voici une leçon"	"didacticiel-modulix"
"342183f7-af51-4e4e-ab4c-ebed1e195063"	"text"	6	3	"73ac3644-7637-4cee-86d4-1a75f53f0b9c"	"Vidéo de présentation de Pix"	"didacticiel-modulix"
"3a9f2269-99ba-4631-b6fd-6802c88d5c26"	"video"	7	3	"73ac3644-7637-4cee-86d4-1a75f53f0b9c"	"Vidéo de présentation de Pix"	"didacticiel-modulix"
"71de6394-ff88-4de3-8834-a40057a50ff4"	"qcu"	8	4	"533c69b8-a836-41be-8ffc-8d4636e31224"	"Voici un vrai-faux"	"didacticiel-modulix"
"30701e93-1b4d-4da4-b018-fa756c07d53f"	"qcm"	9	5	"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"	"Les 3 piliers de Pix"	"didacticiel-modulix"
"0a5e77e8-1c8e-4cb6-a41d-cf6ad7935447"	"qcu"	10	6	"2a77a10f-19a3-4544-80f9-8012dad6506a"	"Activité remonter dans la page"	"didacticiel-modulix"
"c23436d4-6261-49f1-b50d-13a547529c29"	"qrocm"	11	7	"4ce2a31a-6584-4dae-87c6-d08b58d0f3b9"	"Connaissez-vous bien Pix"	"didacticiel-modulix"
"98c51fa7-03b7-49b1-8c5e-49341d35909c"	"qrocm"	12	8	"7cf75e70-8749-4392-8081-f2c02badb0fb"	"Le nom de ce produit"	"didacticiel-modulix"`);
    });
  });
});
