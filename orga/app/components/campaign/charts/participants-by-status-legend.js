import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ParticipantsByStatusLegend extends Component {
  @service elementHelper;
  constructor(...args) {
    super(...args);
    this.canvasId = 'canvas-' + guidFor(this);

    this.elementHelper.waitForElement(this.canvasId).then((element) => {
      element.width = 14;
      element.height = 14;
      const ctx = element.getContext('2d');

      ctx.fillStyle = this.args.dataset.canvas;
      ctx.fillRect(0, 0, 14, 14);
    });
  }
}
