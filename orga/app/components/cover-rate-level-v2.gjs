import * as d3 from 'd3';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import {action} from '@ember/object';
import didInsert from '../modifiers/modifier-did-insert';

const NUM_SEGMENTS = 8;
const SEGMENT_WIDTH = 30;
const SEGMENT_HEIGHT = 30;
const HEADER_SPACE = 30;

export default class CoverRateLevel extends Component {
  id =  guidFor(this) + 'cover-rate-level';

  svg;
  tooltip;
  barGroup;
  global;

  @action
  create() {
    this.svg = d3.select(`svg#${this.id}`)
      .attr("width", 400)
      .attr("height", 100);

    this.tooltip = d3.select('.cover-rate-level-tooltip').node() ?
        d3.select('.cover-rate-level-tooltip') : d3.select('body').append('div').attr('class', 'cover-rate-level-tooltip');

    this.global = this.svg
      .append('g')
      .attr('id', 'global')
      .attr('transform', `translate(2, ${HEADER_SPACE})`)

    this.barGroup = this.global
      .append('g')
      .attr('id', 'bar-group')

    const rect = this.barGroup
      .append("rect")
      .attr('id', 'level-bar')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", NUM_SEGMENTS * SEGMENT_WIDTH)
      .attr("height", SEGMENT_HEIGHT)
      .attr("fill", "#fff")
      .attr("stroke", "#253858")
      .attr("stoke-width", 1)
      .attr("rx", 5)
      .attr('style', 'paint-order: stroke;');


   this.global.selectAll(".separator")
      .data(d3.range(NUM_SEGMENTS - 1))
      .enter()
      .append("line")
      .attr("class", "separator")
      .attr("x1", d => (d + 1) * SEGMENT_WIDTH)
      .attr("y1", 0)
      .attr("x2", d => (d + 1) * SEGMENT_WIDTH)
      .attr("y2", SEGMENT_HEIGHT)
      .attr('stroke', '#253858');

    this.global.append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", 60)
      .text("0");

    this.global.append("text")
      .attr("class", "label")
      .attr("x", NUM_SEGMENTS * SEGMENT_WIDTH)
      .attr("y", 60)
      .text("8");

    this.fillLevel(this.args.maxLevel, this.args.level, this.args.levelForNetwork);
  }

  fillLevel(maxLevel, level, levelForNetwork) {

    // RECT NIVEAU MAX
    this.barGroup
      .append('rect')
      .attr('rx', 5)
      .attr("height", 30)
      .attr('x', NUM_SEGMENTS * SEGMENT_WIDTH)
      .attr("width", 0)
      .attr('fill', "url(#diagonalHatch)")
      .attr('class', 'max-level')
      .on('mouseover', () => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(`Niveau maximum pour ce domaine : ${parseFloat(maxLevel).toFixed(2)}`)
      })
      .on('mousemove', (event) => {
        this.tooltip.style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden');
      })
      .transition()
      .attr("width", (NUM_SEGMENTS - maxLevel) * SEGMENT_WIDTH)
      .attr('x', maxLevel * SEGMENT_WIDTH)
      .duration(500)


    // TEXT NIVEAU MAX
    this.global
      .attr('class', 'label')
      .append('text')
      .attr('y', 10 + 50)
      .attr('x', 0)
      .text(parseFloat(0).toFixed(2))
      .transition()
      .duration(500)
      .attr('x', maxLevel * SEGMENT_WIDTH - 10)
      .text(parseFloat(maxLevel).toFixed(2));


    // RECT NIVEAU UTILISATEUR
    this.barGroup
      .append('rect')
      .attr('rx', 5)
      .attr("fill", "#3b82f6")
      .on('mouseover', () => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(`<ul>
            <li>Niveau des utilisateurs de l'organisation : ${parseFloat(level).toFixed(2)}</li>
            <li>Niveau des utilisateurs du réseau : ${parseFloat(levelForNetwork).toFixed(2)}</li>
          </ul>
         `)
      })
      .on('mousemove', (event) => {
        this.tooltip.style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden');
      })
      .attr('width', 0)
      .attr("height", 30)
      .transition()
      .duration(500)
      .attr("width", level * SEGMENT_WIDTH);

    this.createLevelLine(level, "#291a5d", 'Niveau utilisateur maille de l\'organisation')
    this.createLevelLine(levelForNetwork, "#f87171", 'Niveau utilisateur maille de réseau')
    this.createLevelLabels(level, levelForNetwork);
  }

  createLevelLine(level, color) {
    // LINE NIVEAU UTILISATEUR
    const line = this.svg
      .append('line')

    line
      .attr('x1', 0)
      .attr('y1', HEADER_SPACE - 5)
      .attr('x2', 0)
      .attr('y2', HEADER_SPACE  + SEGMENT_HEIGHT + 10)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .transition()
      .duration(600)
      .attr('x1', level * SEGMENT_WIDTH)
      .attr('x2', level * SEGMENT_WIDTH)

    line
      .clone()
      .attr('x2', level * SEGMENT_WIDTH)
      .attr('x1', level * SEGMENT_WIDTH)
      .attr('stroke', 'transparent').attr('stroke-width', 30)
      .style('cursor', 'pointer')
  }

  createLevelLabels(level, levelForNetwork) {
    const nodes = [
      { x: level * SEGMENT_WIDTH, y: 20, text: `${parseFloat(level).toFixed(2)}` },
      { x: levelForNetwork * SEGMENT_WIDTH, y: 20, text: `${parseFloat(levelForNetwork).toFixed(2)}` },
    ]

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-1))
      .force("collision", d3.forceCollide().radius(12))

    const FIXED_Y = 20;
    simulation.on('tick', () => {
      this.svg.selectAll('g.label-with-collision')
        .attr('transform', d => `translate(${d.x}, ${FIXED_Y})`);
    });

    this.svg
      .selectAll('g.label-with-collision')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'label-with-collision')
      .append('text')
      .text(d => d.text);
  }

  <template>
    <svg id={{this.id}} width="50" height="50" {{didInsert this.create}}>
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2
                 M0,4 l4,-4
                 M3,5 l2,-2"
              style="stroke:#cdd1d9; stroke-width:1" />
      </pattern>
    </svg>
  </template>
}
