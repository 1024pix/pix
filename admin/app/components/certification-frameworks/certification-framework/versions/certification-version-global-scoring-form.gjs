import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class GlobalScoringForm extends Component {
  @service pixToast;
  @service intl;

  get globalScoringConfiguration() {
    const savedConfiguration = this.args.editVersion.globalScoringConfiguration;
    return savedConfiguration?.length
      ? savedConfiguration
      : (this.args.calibrationScoringConfiguration?.globalScoringConfiguration ?? []);
  }

  get previousVersionConfiguration() {
    return this.args.previousVersion?.globalScoringConfiguration ?? [];
  }

  @action
  updateValue(name, index, event) {
    const isMax = name === 'max';
    const newArray = [...this.globalScoringConfiguration];
    newArray.at(index).bounds[name] = Number(event.target.value);

    if (isMax && newArray.at(index + 1)) {
      newArray.at(index + 1).bounds.min = Number(event.target.value);
    }
    this.args.editVersion.globalScoringConfiguration = newArray;
  }

  @action
  isNotFirstRow(index) {
    return index !== 0;
  }

  @action
  isFirstRow(index) {
    return index === 0;
  }

  @action
  lastMaxValue(index) {
    return this.globalScoringConfiguration.at(index - 1)?.bounds.max;
  }

  @action
  isGreaterThanMin(index) {
    return this.globalScoringConfiguration.at(index).bounds.max > this.globalScoringConfiguration.at(index).bounds.min;
  }

  @action
  previousVersionBound(meshLevel, name) {
    const bounds = this.previousVersionConfiguration.find((mesh) => mesh.meshLevel === meshLevel)?.bounds;
    return bounds ? bounds[name] : '—';
  }

  <template>
    <Card
      class="versions-scoring"
      @title={{t "components.certification-frameworks.certification-framework.versions.scoring.title"}}
    >
      <form id="version-scoring-form" class="versions-scoring__form">
        {{#each this.globalScoringConfiguration as |mesh|}}
          <h3>

            {{t
              "components.certification-frameworks.certification-framework.versions.scoring.level"
              index=mesh.meshLevel
            }}</h3>
          <section>
            <PixInput
              type="number"
              step="0.0000000001"
              readonly={{this.isNotFirstRow mesh.meshLevel}}
              required={{this.isFirstRow mesh.meshLevel}}
              @requiredLabel={{if (this.isFirstRow mesh.meshLevel) (t "common.forms.mandatory") false}}
              @value={{if (this.isNotFirstRow mesh.meshLevel) (this.lastMaxValue mesh.meshLevel) mesh.bounds.min}}
              {{on "change" (fn this.updateValue "min" mesh.meshLevel)}}
            >
              <:label>{{t
                  "components.certification-frameworks.certification-framework.versions.scoring.previous-version-capacity"
                  previousVersionCapacity=(this.previousVersionBound mesh.meshLevel "min")
                }}</:label>
            </PixInput>

            <PixInput
              type="number"
              step="0.0000000001"
              required={{this.isFirstRow mesh.meshLevel}}
              @requiredLabel={{if (this.isFirstRow mesh.meshLevel) (t "common.forms.mandatory") false}}
              @errorMessage={{t
                "components.certification-frameworks.certification-framework.versions.scoring.cannot-be-lower-error"
              }}
              @validationStatus={{if (this.isGreaterThanMin mesh.meshLevel) "default" "error"}}
              @value={{mesh.bounds.max}}
              {{on "change" (fn this.updateValue "max" mesh.meshLevel)}}
            >
              <:label>{{t
                  "components.certification-frameworks.certification-framework.versions.scoring.previous-version-capacity"
                  previousVersionCapacity=(this.previousVersionBound mesh.meshLevel "max")
                }}</:label>
            </PixInput>
          </section>
        {{/each}}
      </form>
    </Card>
  </template>
}
