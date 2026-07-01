import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';

import { propsExamples } from '@1024pix/epreuves-components/props.examples';
import { schema as schemas } from '@1024pix/epreuves-components/schema';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import demoEpreuveComponents from '../infrastructure/datasources/learning-content/modules/demo-epreuves-components.json' with { type: 'json' };

export class GenerateDemoEpreuveComponentFile extends Script {
  constructor() {
    super({
      description: 'Generate a file demo-epreuve-component.json',
      permanent: true,
      options: {},
    });
  }

  async handle({ logger }) {
    logger.info(`import schemas and modules from @1024pix`);

    const module = {
      id: '235c680e-cbd2-4c56-bef6-80d3ed4d417a',
      shortId: '0aefd71f',
      slug: 'demo-epreuves-components',
      title: 'Démonstration des composants Pix Épreuves',
      isBeta: true,
      visibility: 'private',
      details: {
        image: 'https://assets.pix.org/modules/placeholder-details.svg',
        description:
          '<p>Ce module est dédié à des tests internes à Pix.</p><p>Il contient normalement tous les composants Pix Épreuves.</p>',
        duration: 2,
        level: 'novice',
        objectives: ['<p>Non régression sur les composants Pix Épreuves.</p>'],
        tabletSupport: 'comfortable',
      },
      sections: [
        {
          id: 'be0a544c-99bd-4fbc-99b4-a52b5456a008',
          type: 'blank',
          grains: Object.entries(schemas)
            .map(([key, _]) => {
              const props = propsExamples[key];
              return generateGrain(key, props);
            })
            .sort(byPOIName),
        },
      ],
      glossary: [],
    };

    logger.info(`START: generate file demo-epreuve-component.json`);

    await fs.writeFile(
      'api/src/devcomp/infrastructure/datasources/learning-content/modules/demo-epreuves-components.json',
      JSON.stringify(module, null, 2),
    );

    logger.info(`END : demo-epreuve-component.json file generated`);
  }
}

function generateGrain(poiName, props) {
  const grain = {};
  const oldGrain = demoEpreuveComponents?.sections[0].grains.find((grain) => grain.title === poiName);

  grain.id = oldGrain?.id ?? randomUUID();
  grain.type = 'discovery';
  grain.title = poiName;
  grain.components = generateComponents(poiName, props, oldGrain);

  return grain;
}

function generateComponents(poiName, props, oldGrain) {
  return [
    {
      type: 'element',
      element: {
        id: oldGrain?.components[0].element.id ?? randomUUID(),
        type: 'text',
        content: `<p>${poiName}</p>`,
        tag: ' ',
      },
    },
    {
      type: 'element',
      element: {
        id: oldGrain?.components[1].element.id ?? randomUUID(),
        type: 'custom',
        instruction: '',
        tagName: poiName,
        props: props,
        title: '',
        functionalInstruction: '',
      },
    },
  ];
}

function byPOIName(previousGrain, nextGrain) {
  return previousGrain.title.localeCompare(nextGrain.title);
}

await ScriptRunner.execute(import.meta.url, GenerateDemoEpreuveComponentFile);
