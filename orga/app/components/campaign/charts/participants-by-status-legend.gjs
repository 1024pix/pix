import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
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

  <template>
    <canvas id={{this.canvasId}} class="participants-by-status__legend-view" />
    <span>{{@dataset.legend}}</span>
    <PixTooltip @id="legend-tooltip-{{@dataset.key}}" @isWide="true" @position="top-left">
      <:triggerElement>
        <PixIcon
          @name="help"
          @plainIcon={{true}}
          class="participants-by-status__legend-tooltip"
          tabindex="0"
          aria-describedby="legend-tooltip-{{@dataset.key}}"
        />
      </:triggerElement>
      <:tooltip>
        {{@dataset.legendTooltip}}
      </:tooltip>
    </PixTooltip>
  </template>
}
