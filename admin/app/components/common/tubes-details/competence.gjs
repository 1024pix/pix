import PixCollapsible from '@1024pix/pix-ui/components/pix-collapsible';
import { eq } from 'ember-truth-helpers';

import Header from '../../table/header';
import Thematic from '../tubes-details/thematic';
import Tube from '../tubes-details/tube';

<template>
  <div class="competence-container">
    <PixCollapsible>
      <:title>{{@title}}</:title>
      <:content>
        <div class="panel">
          <table class="table content-text content-text--small select-tube-table">
            <caption class="screen-reader-only">Sélection des sujets</caption>
            <thead>
              <tr>
                <Header @size="medium" scope="col">
                  <p>Thématiques</p>
                </Header>
                <Header @size="wide" scope="col">
                  <p>Sujets</p>
                </Header>
                <Header @size="small" scope="col">
                  <p>Niveau</p>
                </Header>
                {{#if @displayDeviceCompatibility}}
                  <Header @size="medium" @align="center" scope="col">
                    <p>Compatibilité</p>
                  </Header>
                {{/if}}
              </tr>
            </thead>

            <tbody>
              {{#each @thematics as |thematic|}}
                {{#each thematic.tubes as |tube index|}}
                  <tr class="row-tube" aria-label="Sujet">
                    {{#if (eq index 0)}}
                      <Thematic @name={{thematic.name}} @nbTubes={{thematic.nbTubes}} />
                    {{/if}}
                    <Tube
                      @id={{tube.id}}
                      @title={{tube.title}}
                      @level={{tube.level}}
                      @mobile={{tube.mobile}}
                      @tablet={{tube.tablet}}
                      @skills={{tube.skills}}
                      @displayDeviceCompatibility={{@displayDeviceCompatibility}}
                      @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
                    />
                  </tr>
                {{/each}}
              {{/each}}
            </tbody>
          </table>
        </div>
      </:content>
    </PixCollapsible>
  </div>
</template>
