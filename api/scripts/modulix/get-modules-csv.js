import { fileURLToPath } from 'node:url';

import { getCsvContent } from '../../lib/infrastructure/utils/csv/write-csv-utils.js';
import moduleDatasource from '../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';

export async function getModulesListAsCsv(modules) {
  return await getCsvContent({
    data: modules,
    delimiter: '\t',
    fileHeaders: [
      { label: 'Module', value: 'slug' },
      {
        label: 'ModuleTotalElements',
        value: (row) => row.grains.map((grain) => grain.components.length).reduce((partialSum, a) => partialSum + a, 0),
      },
      { label: 'ModuleLink', value: (row) => `https://app.recette.pix.fr/modules/${row.slug}` },
      { label: 'ModuleLevel', value: 'details.level' },
      { label: 'ModuleTotalGrains', value: 'grains.length' },
      {
        label: 'ModuleTotalLessons',
        value: (row) => row.grains.filter((grain) => grain.type === 'lesson').length,
      },
      {
        label: 'ModuleTotalActivities',
        value: (row) => row.grains.filter((grain) => grain.type === 'activity').length,
      },
      { label: 'ModuleDuration', value: (row) => `=TEXT(${row.details.duration}/24/60; "mm:ss")` },
    ],
  });
}

// Only run the following if the file is called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);

  if (process.argv[1] === modulePath) {
    const modules = await moduleDatasource.list();
    console.log(await getModulesListAsCsv(modules));
  }
}
