import ScoBlockedAccessDates from './sco-blocked-access-dates';
import ScoRedirectToAnnouncement from './sco-redirect-to-announcement';
import ScoWhitelistConfiguration from './sco-whitelist-configuration';

<template>
  <ScoBlockedAccessDates @scoBlockedAccessDates={{@scoBlockedAccessDates}} />
  <ScoWhitelistConfiguration />
  <ScoRedirectToAnnouncement />
</template>
