import FrameworkHistory from './framework-history';
import History from './target-profile/history';

<template>
  <FrameworkHistory
    @frameworkKey={{@certificationFramework.scope}}
    @certificationVersionSummaries={{@certificationFramework.versionSummaries}}
  />

  {{#if @certificationFramework.hasTargetProfilesHistory}}
    <History @targetProfilesHistory={{@certificationFramework.complementaryCertification.targetProfilesHistory}} />
  {{/if}}
</template>
