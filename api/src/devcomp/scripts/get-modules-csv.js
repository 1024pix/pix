// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import { fileURLToPath } from 'node:url';

import { getCsvContent } from '../../shared/infrastructure/utils/csv/write-csv-utils.js';
import moduleDatasource from '../infrastructure/datasources/learning-content/module-datasource.js';
import { getGrains } from './utils/get-grains.js';

export async function getModulesListAsCsv(modules) {
  return await getCsvContent({
    data: modules,
    delimiter: '\t',
    fileHeaders: [
      { label: 'Module', value: 'id' },
      { label: 'ModuleSlug', value: 'slug' },
      { label: 'ModuleLevel', value: 'details.level' },
      { label: 'ModuleLink', value: (row) => `https://app.recette.pix.fr/modules/${row.slug}` },
      { label: 'ModuleTotalGrains', value: (row) => getGrains(row).length },
      {
        label: 'ModuleTotalActivities',
        value: (row) => getGrains(row).filter((grain) => grain.type === 'activity').length,
      },
      {
        label: 'ModuleTotalLessons',
        value: (row) =>
          getGrains(row).filter((grain) => grain.type === 'lesson' || grain.type === 'short-lesson').length,
      },
      { label: 'ModuleDuration', value: (row) => `=TEXT(${row.details.duration}/24/60; "mm:ss")` },
      {
        label: 'ModuleTotalElements',
        value: (row) => _getTotalElementsCount(getGrains(row)),
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
