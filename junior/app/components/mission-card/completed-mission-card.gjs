import Background from './mission-card-completed-background';

<template>
  <div class="mission-card__container">
    {{#if @missionLabelStatus}}
      <div class="status status--completed">
        <p>{{@missionLabelStatus}}</p>
      </div>
    {{/if}}

    <div class="mission-icon--completed">
      <img src="/images/mission/icon/finished-icon.svg" alt="" />
    </div>
    <Background @areaCode={{@areaCode}} />
    <div class="completed-mission-card-bottom">
      <p>{{@title}}</p>
    </div>

  </div>
</template>
