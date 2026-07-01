// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import moduleDatasource from '../infrastructure/datasources/learning-content/module-datasource.js';

/**
 * List all modules for DB replication with id, shortId, slug and title
 * @returns {Promise<void>}
 */
async function listModulesForDBReplication() {
  const imports = await moduleDatasource.listModulesWithFilename();
  console.log('--- List of modules for DB replication ---');
  const moduleInformation = imports.map((module) => {
    const moduleObjectivesInline = module.details.objectives.join(', ');
    return {
      id: module.id,
      shortId: module.shortId,
      slug: module.slug,
      title: module.title,
      filename: module.filename,
      level: module.details.level,
      duration: module.details.duration,
      objectives: moduleObjectivesInline,
      isBeta: module.isBeta,
      visibility: module.visibility,
    };
  });
  console.log(JSON.stringify(moduleInformation, null, 2).replace(/"([^"]+)": "([^"]+)"/g, "$1: '$2'"));
}

/*
 * List all modules for Metabase filter with id, slug
 * @returns {Promise<void>}
 */
async function listModulesForMetabaseFilter() {
  const imports = await moduleDatasource.list();
  console.log('--- List of modules for Metabase filter ---');
  imports.map((module) => {
    console.log(`${module.id}, ${module.slug}`);
  });
}

async function main() {
  if (process.argv[2] === 'metabase-filter') {
    await listModulesForMetabaseFilter();
    return;
  }
  await listModulesForDBReplication();
}

await main();
