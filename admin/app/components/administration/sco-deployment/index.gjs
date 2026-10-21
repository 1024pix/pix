import ScoAnnouncement from './sco-announcement';
import ScoBlockedAccessDates from './sco-blocked-access-dates';
import ScoWhitelistConfiguration from './sco-whitelist-configuration';

<template>
  <ScoBlockedAccessDates @scoBlockedAccessDates={{@scoBlockedAccessDates}} />
  <ScoWhitelistConfiguration />
  <ScoAnnouncement />
</template>
