import CampaignName from './campaign-name';

<template>
  {{#if @campaign.course}}
    <CampaignName @campaign={{@campaign}} @errors={{@errors}} />
  {{/if}}
</template>
