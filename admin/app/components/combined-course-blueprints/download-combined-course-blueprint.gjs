import { PixButtonLink } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixButtonLink
    @href={{makeHref @blueprint @creatorId}}
    @size="small"
    @variant={{@variant}}
    download="{{@blueprint.name}}.csv"
    @iconBefore="download"
  >
    {{t "components.combined-course-blueprints.list.downloadButton"}}
  </PixButtonLink>
</template>

function makeHref(blueprint, creatorId) {
  const jsonParsed = JSON.stringify({
    name: blueprint.name,
    description: blueprint.description,
    illustration: blueprint.illustration,
  });
  const exportedData = [
    [
      'Identifiant des organisations*',
      'Identifiant du createur des campagnes*',
      'Json configuration for quest*',
      'Identifiant du schéma de parcours*',
    ],
    ['', creatorId.toString(), jsonParsed, blueprint.id.toString()],
  ];

  const csvContent = exportedData
    .map((line) => line.map((data) => `"${data.replaceAll('"', '""').replaceAll('\\""', '\\"')}"`).join(';'))
    .join('\n');

  return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
}
