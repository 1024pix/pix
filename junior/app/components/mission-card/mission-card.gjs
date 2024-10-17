import Component from '@glimmer/component';

import MissionCardBackGround from './mission-card-background';

export default class MissionCard extends Component {
  get imageUrl() {
    console.log(this.args.cardImageUrl);
    return this.args.cardImageUrl ? this.args.cardImageUrl : '/images/mission/icon/pix-junior-logo-white.svg';
  }

  get classIcon() {
    console.log(this.args.cardImageUrl);
    return this.args.cardImageUrl ? 'mission-icon' : 'mission-icon-default';
  }
  <template>
    <div class="mission-card__container">
      {{#if @missionLabelStatus}}
        <div class="status">
          <p>{{@missionLabelStatus}}</p>
        </div>
      {{/if}}
      {{#if @displayStartedIcon}}
        <div class="started-icon">
          <img src="/images/mission/icon/started-icon.svg" alt="" aria-hidden="true" />
        </div>
      {{/if}}

      <div class={{this.classIcon}}>
        <img src={{this.imageUrl}} aria-hidden="true" class="icon" />
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
}
