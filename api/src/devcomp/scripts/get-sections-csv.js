// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import { fileURLToPath } from 'node:url';

import { getCsvContent } from '../../shared/infrastructure/utils/csv/write-csv-utils.js';
import moduleDatasource from '../infrastructure/datasources/learning-content/module-datasource.js';

export async function getSectionsListAsCsv(modules) {
  const sections = getSections(modules);

  return await getCsvContent({
    data: sections,
    delimiter: '\t',
    fileHeaders: [
      { label: 'SectionModule', value: 'moduleId' },
      { label: 'SectionId', value: 'id' },
      { label: 'SectionType', value: 'type' },
      { label: 'SectionPosition', value: (row) => row.sectionPosition + 1 },
    ],
  });
}

function getSections(modules) {
  const SECTION_TYPES = [
    'question-yourself',
    'explore-to-understand',
    'retain-the-essentials',
    'practise',
    'go-further',
    'blank',
  ];

  const sections = [];
  for (const module of modules) {
    let sectionPosition = -1;

    for (const section of module.sections) {
      sectionPosition++;
      if (!SECTION_TYPES.includes(section.type)) {
        continue;
      }

      sections.push({
        ...section,
        moduleId: module.id,
        sectionPosition: sectionPosition,
      });
    }
  }

  return sections;
}

// Only run the following if the file is called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);

  if (process.argv[1] === modulePath) {
    const modules = await moduleDatasource.list();
    console.log(await getSectionsListAsCsv(modules));
  }
}
