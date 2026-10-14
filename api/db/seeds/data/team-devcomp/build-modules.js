import { bacASableModule } from './fixtures/bac-a-sable-module.js';

const ORIGINAL_SANDBOX_MODULE_SHORT_ID = '6a68bf32';

export async function buildModules(databaseBuilder) {
  const {
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    sections,
    glossary,
    image,
    description,
    duration,
    level,
    tabletSupport,
    objectives,
  } = bacASableModule;

  await databaseBuilder
    .knex('learningcontent.modules')
    .where({ shortId: ORIGINAL_SANDBOX_MODULE_SHORT_ID })
    .update({
      shortId,
      slug,
      title,
      isBeta,
      visibility,
      image,
      description,
      duration,
      level,
      tabletSupport,
      objectives,
      sections: JSON.stringify(sections),
      glossary: JSON.stringify(glossary),
    });

  return shortId;
}
