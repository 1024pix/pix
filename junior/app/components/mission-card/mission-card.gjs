import MissionCardBackGround from './mission-card-background';

<template>
  <div class="mission-card__container">
    {{#if @missionLabelStatus}}
      <div class="status">

        <p>{{@missionLabelStatus}}</p>
      </div>
    {{/if}}

    <div class="mission-icon">
      <img src="/images/mission/icon/area-code-{{@areaCode}}.svg" alt="mission-icon" />
    </div>

    <MissionCardBackGround @class="area-code-{{@areaCode}}" @areaCode={{@areaCode}} />

    <div class="area-code-{{@areaCode}} mission-card-bottom">
      <div class="mission-name area-code-{{@areaCode}}">
        <p> {{@title}}</p>
      </div>

      {{#if @missionButtonLabel}}
        <div class="fake-button">
          <p>{{@missionButtonLabel}}</p>
        </div>
      {{/if}}
    </div>
  </div>
</template>
