import FrameworkHistory from './framework-history';
import History from './target-profile/history';

<template>
  <FrameworkHistory
    @frameworkKey={{@certificationFramework.scope}}
    @certificationVersionSummaries={{@certificationFramework.versionSummaries}}
  />

  {{#if @certificationFramework.hasTargetProfilesHistory}}
    <History @targetProfileSummaries={{@certificationFramework.targetProfileSummaries}} />
  {{/if}}
</template>
