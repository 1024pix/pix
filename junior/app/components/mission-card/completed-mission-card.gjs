import Background from './mission-card-completed-background';

<template>
  <div class="mission-card__container">
    {{#if @missionLabelStatus}}
      <div class="status">
        <p>{{@missionLabelStatus}}</p>
      </div>
    {{/if}}

    <div class="mission-icon--completed">
      <img src="images/mission/icon/finished-icon.svg" alt="mission-icon" />
    </div>
    <Background @areaCode={{@areaCode}} />
    <div class="completed-mission-card-bottom">
      <p>{{@title}}</p>
    </div>

  </div>
</template>
