import { fileURLToPath } from 'node:url';

import { getCsvContent } from '../../lib/infrastructure/utils/csv/write-csv-utils.js';
import moduleDatasource from '../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';

export async function getAnswerableElementsListAsCsv(modules) {
  const elements = getAnswerableElements(modules);

  return await getCsvContent({
    data: elements,
    delimiter: '\t',
    fileHeaders: [
      { label: 'ElementId', value: 'id' },
      { label: 'ElementType', value: 'type' },
      { label: 'ActivityElementPosition', value: (row) => row.activityElementPosition + 1 },
      { label: 'ElementInstruction', value: 'instruction' },
      { label: 'ElementGrainPosition', value: (row) => row.grainPosition + 1 },
      { label: 'ElementGrainId', value: 'grainId' },
      { label: 'ElementGrainTitle', value: 'grainTitle' },
      { label: 'ElementModuleSlug', value: 'moduleSlug' },
    ],
  });
}

// Only run the following if the file is called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);

  if (process.argv[1] === modulePath) {
    const modules = await moduleDatasource.list();
    console.log(await getAnswerableElementsListAsCsv(modules));
  }
}

export function getAnswerableElements(modules) {
  const ANSWERABLE_ELEMENT_TYPES = ['qcm', 'qcu', 'qrocm'];

  const elements = [];
  for (const module of modules) {
    let activityElementPosition = 0;

    for (const grain of module.grains) {
      for (const component of grain.components) {
        if (component.type === 'element') {
          if (!ANSWERABLE_ELEMENT_TYPES.includes(component.element.type)) {
            continue;
          }

          elements.push({
            ...component.element,
            moduleSlug: module.slug,
            activityElementPosition: activityElementPosition++,
            grainPosition: module.grains.indexOf(grain),
            grainId: grain.id,
            grainTitle: grain.title,
          });
        }

        if (component.type === 'stepper') {
          for (const step of component.steps) {
            for (const element of step.elements) {
              if (!ANSWERABLE_ELEMENT_TYPES.includes(element.type)) {
                continue;
              }

              elements.push({
                ...element,
                moduleSlug: module.slug,
                activityElementPosition: activityElementPosition++,
                grainPosition: module.grains.indexOf(grain),
                grainId: grain.id,
                grainTitle: grain.title,
              });
            }
          }
        }
      }
    }
  }

  return elements;
}
