const SEEDS_CONTEXTS = [
  'prescription',
  'devcomp',
  'junior',
  'acces',
  'contenu',
  'certification',
  'evaluation',
  'acquisition',
];

export const seedsConfig = getSeedsConfig();

function getSeedsConfig() {
  const context = buildSeedsContext(process.env.SEEDS_CONTEXT);

  const frameworks = process.env.SEEDS_LEARNING_CONTENT_FRAMEWORKS?.split(',') ?? ['Pix', 'Droit', 'Edu', 'Modulix'];
  if (context.junior && !frameworks.includes('Pix 1D')) {
    frameworks.push('Pix 1D');
  }

  return {
    context,
    learningContent: {
      frameworks,
      locales: process.env.SEEDS_LEARNING_CONTENT_LOCALES?.split(',') ?? ['fr-fr', 'en', 'nl', 'nl-BE'],
    },
  };
}

function buildSeedsContext(value) {
  const values = value && value.length ? value.toLowerCase().split('|') : SEEDS_CONTEXTS;
  return Object.fromEntries(Array.from(SEEDS_CONTEXTS, (v) => [v, values.includes(v)]));
}
