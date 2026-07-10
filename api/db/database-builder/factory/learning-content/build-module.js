import { databaseBuffer } from '../../database-buffer.js';

const defaultSections = [
  {
    id: 'cfaefec9-e185-43b8-8258-e8beff6dd56b',
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
              id: 'd5e369ec-2a5e-4692-ac46-5be5a49f2acd',
              type: 'text',
              tag: 'context',
              isAnswerable: false,
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
  title = 'apprendre à être mou',
  isBeta = false,
  visibility = 'public',
  details = {
    image: 'https://assets.pix.org/draft/escargots.jpg',
    description:
      "<p>Ce module est dédié aux escargots</p><p>Il contient normalement l'intégralité de leurs secrets disponibles à date.</p>",
    duration: 7,
    level: 'novice',
    objectives: ['Connaître les petits secrets des gastéropodes'],
    tabletSupport: 'inconvenient',
  },
  sections = defaultSections,
  glossary = [
    {
      word: 'coquille',
      definition:
        "Une coquille est un agglomérat de calcaire très résistant. Sa structure cristalline spécifique lui confère une résistance protectrice. Elle prodique à l'escargot toute sa force et sa vitalité.",
    },
  ],
} = {}) {
  const values = {
    id,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    details,
    sections,
    glossary,
  };
  buildModuleInDB(values);
  return values;
}

export function buildModuleWithNoDefaultValues({
  id,
  shortId,
  slug,
  title,
  isBeta,
  visibility,
  details,
  sections,
  glossary,
}) {
  const values = {
    id,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    details,
    sections,
    glossary,
  };
  buildModuleInDB(values);
  return values;
}

function buildModuleInDB({ id, shortId, slug, title, isBeta, visibility, details, sections, glossary, version }) {
  const values = {
    id,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    ...details,
    sections: JSON.stringify(sections),
    glossary: JSON.stringify(glossary),
    version,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.modules',
    values,
  });
}
