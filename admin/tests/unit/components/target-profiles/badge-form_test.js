import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import createComponent from "../../../helpers/create-glimmer-component";

module("Unit | Component | Badges | badgeForm", function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createComponent("component:target-profiles/badge-form", {});
  });

  test("it should update BadgeLogoUrl form attribute with appropriate base URL if not provided", async function(assert) {
    // given
    const baseURL = "https://images.pix.fr/badges/";
    component.imageName = "new-logo.svg"
    // when
    const result = component.getBadgeLogoUrl();

    // then
    assert.deepEqual(result, `${baseURL}new-logo.svg`);
  });

  test('it should accept the BadgeLogoUrl form attribute with a complete URL', async function(assert) {
    // given
    const baseURL = "https://images.pix.fr/badges/";
    component.imageName = `${baseURL}new-logo.svg`
    // when
    const result = component.getBadgeLogoUrl();

    // then
    assert.deepEqual(result, `${baseURL}new-logo.svg`);
  });

  test("it should add missing extension files in editorLogoUrl", async function(assert) {
    // given
    const baseURL = "https://images.pix.fr/badges/";
    component.imageName = `${baseURL}new-logo`
    // when
    const result = component.getBadgeLogoUrl();

    // then
    assert.deepEqual(result, `${baseURL}new-logo.svg`);
  });
});
