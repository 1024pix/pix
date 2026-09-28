const NEBULIX = "@1024pix/nebulix-ember";

const NEBULIX_COMPONENTS = new Set([
  "PixAccordions",
  "PixAppLayout",
  "PixBannerAlert",
  "PixBlock",
  "PixBreadcrumb",
  "PixButton",
  "PixButtonLink",
  "PixButtonUpload",
  "PixCard",
  "PixCheckbox",
  "PixCode",
  "PixFilterBanner",
  "PixFilterableAndSearchableSelect",
  "PixGauge",
  "PixIcon",
  "PixIconButton",
  "PixIndicatorCard",
  "PixInput",
  "PixInputCode",
  "PixInputPassword",
  "PixLabel",
  "PixModal",
  "PixMultiSelect",
  "PixNavigation",
  "PixNavigationButton",
  "PixNavigationSeparator",
  "PixNavigationShrunkButton",
  "PixNotificationAlert",
  "PixOverlay",
  "PixPagination",
  "PixProgressBar",
  "PixRadioButton",
  "PixSearchInput",
  "PixSegmentedControl",
  "PixSelect",
  "PixSidePanel",
  "PixStars",
  "PixStepper",
  "PixStructureSwitcher",
  "PixTable",
  "PixTableColumn",
  "PixTabs",
  "PixTag",
  "PixTextarea",
  "PixToastContainer",
  "PixToggle",
  "PixTooltip",
]);

const NEBULIX_MODIFIERS = new Set([
  "modal-dialog",
  "on-arrow-down-up-action",
  "on-enter-action",
  "on-escape-action",
  "on-space-action",
  "on-window-resize",
  "trap-focus",
]);

const COMPONENT_IMPORT =
  /^import (\w+) from '@1024pix\/pix-ui\/components\/([\w-]+)';\n/gm;

const MODIFIER_IMPORT =
  /^import (\w+) from '@1024pix\/pix-ui\/(?:addon\/)?modifiers\/([\w-]+)';\n/gm;

const NEBULIX_IMPORT = /^import \{([^}]*)\} from '@1024pix\/nebulix-ember';\n/m;

const PIX_UI_REFERENCE = /['"]@1024pix\/pix-ui[/'"]/;

function toPascalCase(name) {
  return name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

export function transform(source) {
  const specifiers = [];
  let firstImportIndex = -1;

  let code = source.replace(COMPONENT_IMPORT, (match, local, file, offset) => {
    const exported = toPascalCase(file);
    if (!NEBULIX_COMPONENTS.has(exported)) return match;
    if (firstImportIndex === -1) firstImportIndex = offset;
    specifiers.push(exported === local ? local : `${exported} as ${local}`);
    return "";
  });

  let converted = specifiers.length;

  if (specifiers.length > 0) {
    const existing = code.match(NEBULIX_IMPORT);
    if (existing) {
      specifiers.push(
        ...existing[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
    const merged = [...new Set(specifiers)].sort();
    const nebulixImport = `import { ${merged.join(", ")} } from '${NEBULIX}';\n`;

    if (existing) {
      code = code.replace(NEBULIX_IMPORT, nebulixImport);
    } else {
      code =
        code.slice(0, firstImportIndex) +
        nebulixImport +
        code.slice(firstImportIndex);
    }
  }

  code = code.replace(MODIFIER_IMPORT, (match, local, file) => {
    if (!NEBULIX_MODIFIERS.has(file)) return match;
    converted++;
    return `import ${local} from '${NEBULIX}/modifiers/${file}';\n`;
  });

  const warnings = code
    .split("\n")
    .map((statement, index) => ({ line: index + 1, statement }))
    .filter(({ statement }) => PIX_UI_REFERENCE.test(statement));

  return { code, converted, warnings };
}
