import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import Header from '../../table/header';
import Thematic from './thematic';
import Tube from './tube';

<template>
  <div class="competence-container">
    <PixAccordions>
      <:title>{{@title}}</:title>
      <:content>
        <div class="panel">
          <table class="table content-text content-text--small select-tube-table">
            <caption class="screen-reader-only">Sélection des sujets</caption>
            <thead>
              <tr>
                <Header @size="medium" scope="col">
                  <p>{{t "components.combined-course-blueprints.reward-requirements.thematics"}}</p>
                </Header>
                <Header @size="wide" scope="col">
                  <p>{{t "components.combined-course-blueprints.reward-requirements.tubes"}}</p>
                </Header>
                <Header @size="small" scope="col">
                  <p>{{t "components.combined-course-blueprints.reward-requirements.levels"}}</p>
                </Header>
              </tr>
            </thead>

            <tbody>
              {{#each @thematics as |thematic|}}
                {{#each thematic.tubes as |tube index|}}
                  <tr
                    class="row-tube"
                    aria-label={{t "components.combined-course-blueprints.reward-requirements.tubes"}}
                  >
                    {{#if (eq index 0)}}
                      <Thematic @name={{thematic.name}} @nbTubes={{thematic.tubes.length}} />
                    {{/if}}
                    <Tube @id={{tube.id}} @title={{tube.practicalTitle}} @level={{tube.level}} />
                  </tr>
                {{/each}}
              {{/each}}
            </tbody>
          </table>
        </div>
      </:content>
    </PixAccordions>
  </div>
</template>
