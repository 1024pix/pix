import CampaignName from './campaign-name';
import CampaignOwner from './campaign-owner';
import ExternalId from './external-id';
import MultipleSendings from './multiple-sendings';

<template>
  <CampaignName @campaign={{@campaign}} @errors={{@errors}} />

  <CampaignOwner @campaign={{@campaign}} @membersSortedByFullName={{@membersSortedByFullName}} />

  <MultipleSendings
    @campaign={{@campaign}}
    @labelKey="pages.campaign-creation.multiple-sendings.profiles.question-label"
    @infoKey="pages.campaign-creation.multiple-sendings.profiles.info"
  />

  <ExternalId @campaign={{@campaign}} @errors={{@errors}} />
</template>
