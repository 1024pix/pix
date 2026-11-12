import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';

const defaultSections = [
  {
    id: 'cfaefec9-e185-43b8-8258-e8beff6dd77b',
    type: 'question-yourself',
    grains: [
      {
        id: '9de10c46-df0e-41f5-a709-81637f0d5cc3',
        type: 'challenge',
        title: 'Element text avec tags',
        components: [
          {
            type: 'element',
            element: {
              id: 'd5e779ec-2a5e-4692-ac46-5be5a49f2acd',
              type: 'text',
              tag: 'context',
              content: "<p>Ceci&nbsp;est un contenu pour les amateurs de coquille d'escargots.</p>",
            },
          },
        ],
      },
    ],
  },
];

export function buildModule({
  id = crypto.randomUUID(),
  shortId = 'escargou',
  slug = 'petit-escargot-pignouf',
  internalTitle = 'NAT_escargot',
  title = 'Apprendre à être mou',
  isBeta = false,
  visibility = 'public',
  details = {},
  sections = defaultSections,
  glossary = [
    {
      words: ['coquille'],
      definition:
        "Une coquille est un agglomérat de calcaire très résistant. Sa structure cristalline spécifique lui confère une résistance protectrice. Elle prodique à l'escargot toute sa force et sa vitalité.",
    },
  ],
  version = '1.0',
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  const {
    image = 'https://assets.pix.org/draft/escargots.jpg',
    description = "<p>Ce module est dédié aux escargots</p><p>Il contient normalement l'intégralité de leurs secrets disponibles à date.</p>",
    duration = 7,
    level = 'novice',
    objectives = ['Connaître les petits secrets des gastéropodes'],
    tabletSupport = 'inconvenient',
  } = details;
  return new Module({
    id,
    shortId,
    internalTitle,
    slug,
    title,
    isBeta,
    visibility,
    details: { image, description, duration, level, objectives, tabletSupport },
    sections,
    glossary,
    version,
    createdAt,
    updatedAt,
  });
}
