import Component from '@glimmer/component';
export default class RobotDialog extends Component {
  get getRobotImageUrl() {
    return `/images/robot/dialog-robot-${this.args.class ? this.args.class : 'default'}.svg`;
  }

  <template>
    <div class="robot-speaking">
      <img class="robot-speaking__logo" alt="mascotte pix1d" src={{this.getRobotImageUrl}} />
      <div class="bubbles">
        {{yield}}
      </div>
    </div>
  </template>
}
