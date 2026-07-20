import BadgesList from './target-profile/badges-list';
import History from './target-profile/history';
import Information from './target-profile/information';

<template>
  <Information @currentTargetProfile={{@certificationFramework.activeTargetProfileSummary}} />
  <BadgesList @currentTargetProfile={{@certificationFramework.activeTargetProfileSummary}} />
  <History @targetProfileSummaries={{@certificationFramework.targetProfileSummaries}} />
</template>
