import { fileURLToPath } from 'node:url';

import moduleDatasource from '../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { getCsvContent } from '../../src/shared/infrastructure/utils/csv/write-csv-utils.js';

export async function getModulesListAsCsv(modules) {
  return await getCsvContent({
    data: modules,
    delimiter: '\t',
    fileHeaders: [
      { label: 'ModuleId', value: 'id' },
      { label: 'ModuleSlug', value: 'slug' },
      { label: 'ModuleTitle', value: 'title' },
      { label: 'ModuleLevel', value: 'details.level' },
      { label: 'ModuleLink', value: (row) => `https://app.recette.pix.fr/modules/${row.slug}` },
      {
        label: 'ModuleIsBeta',
        value: (row) => (row.isBeta ? '=TRUE' : '=FALSE'),
      },
      {
        label: 'ModuleObjectives',
        value: (row) => row.details.objectives.join('.'),
      },
      { label: 'ModuleTotalGrains', value: 'grains.length' },
      {
        label: 'ModuleTotalLessons',
        value: (row) => row.grains.filter((grain) => grain.type === 'lesson').length,
      },
      {
        label: 'ModuleTotalActivities',
        value: (row) => row.grains.filter((grain) => grain.type === 'activity').length,
      },
      {
        label: 'ModuleTotalChallenges',
        value: (row) => row.grains.filter((grain) => grain.type === 'challenge').length,
      },
      {
        label: 'ModuleTotalDiscoveries',
        value: (row) => row.grains.filter((grain) => grain.type === 'discovery').length,
      },
      {
        label: 'ModuleTotalSummaries',
        value: (row) => row.grains.filter((grain) => grain.type === 'summary').length,
      },
      {
        label: 'ModuleTotalTransitions',
        value: (row) => row.grains.filter((grain) => grain.type === 'transition').length,
      },
      { label: 'ModuleDuration', value: (row) => `=TEXT(${row.details.duration}/24/60; "mm:ss")` },
      {
        label: 'ModuleTotalElements',
        value: (row) => _getTotalElementsCount(row.grains),
      },
    ],
  });
}

export function _getTotalElementsCount(grains) {
  let totalElements = 0;
  for (const grain of grains) {
    for (const component of grain.components) {
      switch (component.type) {
        case 'element':
          totalElements += 1;
          break;
        case 'stepper':
          for (const step of component.steps) {
            totalElements += step.elements.length;
          }
          break;
        default:
          throw new Error(`Component type "${component.type}" is not available`);
      }
    }
  }

  return totalElements;
}

// Only run the following if the file is called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);

  if (process.argv[1] === modulePath) {
    const modules = await moduleDatasource.list();
    console.log(await getModulesListAsCsv(modules));
  }
}
