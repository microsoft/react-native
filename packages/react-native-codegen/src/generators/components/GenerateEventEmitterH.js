/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const nullthrows = require('nullthrows');

const {
  getCppTypeForAnnotation,
  toSafeCppString,
  generateEventStructName,
} = require('./CppHelpers.js');

import type {
  ComponentShape,
  EventTypeShape,
  NamedShape,
  EventTypeAnnotation,
  SchemaType,
} from '../../CodegenSchema';

// File path -> contents
type FilesOutput = Map<string, string>;
type StructsMap = Map<string, string>;

type ComponentCollection = $ReadOnly<{
  [component: string]: ComponentShape,
  ...,
}>;

const FileTemplate = ({componentEmitters}: {componentEmitters: string}) => `
/**
 * ${'C'}opyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * ${'@'}generated by codegen project: GenerateEventEmitterH.js
 */
#pragma once

#include <react/renderer/components/view/ViewEventEmitter.h>

namespace facebook {
namespace react {

${componentEmitters}

} // namespace react
} // namespace facebook
`;

const ComponentTemplate = ({
  className,
  structs,
  events,
}: {
  className: string,
  structs: string,
  events: string,
}) =>
  `
class ${className}EventEmitter : public ViewEventEmitter {
 public:
  using ViewEventEmitter::ViewEventEmitter;

  ${structs}

  ${events}
};
`.trim();

const StructTemplate = ({
  structName,
  fields,
}: {
  structName: string,
  fields: string,
}) =>
  `
  struct ${structName} {
    ${fields}
  };
`.trim();

const EnumTemplate = ({
  enumName,
  values,
  toCases,
}: {
  enumName: string,
  values: string,
  toCases: string,
}) =>
  `enum class ${enumName} {
  ${values}
};

static char const *toString(const ${enumName} value) {
  switch (value) {
    ${toCases}
  }
}
`.trim();

function indent(nice: string, spaces: number) {
  return nice
    .split('\n')
    .map((line, index) => {
      if (line.length === 0 || index === 0) {
        return line;
      }
      const emptySpaces = new Array(spaces + 1).join(' ');
      return emptySpaces + line;
    })
    .join('\n');
}

function getNativeTypeFromAnnotation(
  componentName: string,
  eventProperty: NamedShape<EventTypeAnnotation>,
  nameParts: $ReadOnlyArray<string>,
): string {
  const {type} = eventProperty.typeAnnotation;

  switch (type) {
    case 'BooleanTypeAnnotation':
    case 'StringTypeAnnotation':
    case 'Int32TypeAnnotation':
    case 'DoubleTypeAnnotation':
    case 'FloatTypeAnnotation':
      return getCppTypeForAnnotation(type);
    case 'StringEnumTypeAnnotation':
      return generateEventStructName(nameParts.concat([eventProperty.name]));
    case 'ObjectTypeAnnotation':
      return generateEventStructName(nameParts.concat([eventProperty.name]));
    default:
      (type: empty);
      throw new Error(`Received invalid event property type ${type}`);
  }
}
function generateEnum(structs, options, nameParts) {
  const structName = generateEventStructName(nameParts);
  const fields = options
    .map((option, index) => `${toSafeCppString(option)}`)
    .join(',\n  ');

  const toCases = options
    .map(
      option =>
        `case ${structName}::${toSafeCppString(option)}: return "${option}";`,
    )
    .join('\n' + '    ');

  structs.set(
    structName,
    EnumTemplate({
      enumName: structName,
      values: fields,
      toCases: toCases,
    }),
  );
}

function generateStruct(
  structs: StructsMap,
  componentName: string,
  nameParts: $ReadOnlyArray<string>,
  properties: $ReadOnlyArray<NamedShape<EventTypeAnnotation>>,
): void {
  const structNameParts = nameParts;
  const structName = generateEventStructName(structNameParts);

  const fields = properties
    .map(property => {
      return `${getNativeTypeFromAnnotation(
        componentName,
        property,
        structNameParts,
      )} ${property.name};`;
    })
    .join('\n' + '  ');

  properties.forEach(property => {
    const {name, typeAnnotation} = property;
    switch (typeAnnotation.type) {
      case 'BooleanTypeAnnotation':
        return;
      case 'StringTypeAnnotation':
        return;
      case 'Int32TypeAnnotation':
        return;
      case 'DoubleTypeAnnotation':
        return;
      case 'FloatTypeAnnotation':
        return;
      case 'ObjectTypeAnnotation':
        generateStruct(
          structs,
          componentName,
          nameParts.concat([name]),
          nullthrows(typeAnnotation.properties),
        );
        return;
      case 'StringEnumTypeAnnotation':
        generateEnum(structs, typeAnnotation.options, nameParts.concat([name]));
        return;
      default:
        (typeAnnotation.type: empty);
        throw new Error(
          `Received invalid event property type ${typeAnnotation.type}`,
        );
    }
  });

  structs.set(
    structName,
    StructTemplate({
      structName,
      fields,
    }),
  );
}

function generateStructs(componentName: string, component): string {
  const structs: StructsMap = new Map();

  component.events.forEach(event => {
    if (event.typeAnnotation.argument) {
      generateStruct(
        structs,
        componentName,
        [event.name],
        event.typeAnnotation.argument.properties,
      );
    }
  });

  return Array.from(structs.values()).join('\n\n');
}

function generateEvent(componentName: string, event: EventTypeShape): string {
  if (event.typeAnnotation.argument) {
    const structName = generateEventStructName([event.name]);

    return `void ${event.name}(${structName} value) const;`;
  }

  return `void ${event.name}() const;`;
}
function generateEvents(componentName: string, component): string {
  return component.events
    .map(event => generateEvent(componentName, event))
    .join('\n\n' + '  ');
}

module.exports = {
  generate(
    libraryName: string,
    schema: SchemaType,
    packageName?: string,
    assumeNonnull: boolean = false,
  ): FilesOutput {
    const moduleComponents: ComponentCollection = Object.keys(schema.modules)
      .map(moduleName => {
        const module = schema.modules[moduleName];
        if (module.type !== 'Component') {
          return;
        }

        const {components} = module;
        // No components in this module
        if (components == null) {
          return null;
        }

        return components;
      })
      .filter(Boolean)
      .reduce((acc, components) => Object.assign(acc, components), {});

    const moduleComponentsWithEvents = Object.keys(moduleComponents).filter(
      componentName => moduleComponents[componentName].events.length > 0,
    );

    const fileName = 'EventEmitters.h';

    const componentEmitters =
      moduleComponentsWithEvents.length > 0
        ? Object.keys(moduleComponents)
            .map(componentName => {
              const component = moduleComponents[componentName];

              const replacedTemplate = ComponentTemplate({
                className: componentName,
                structs: indent(generateStructs(componentName, component), 2),
                events: generateEvents(componentName, component),
              });

              return replacedTemplate;
            })
            .join('\n')
        : '';

    const replacedTemplate = FileTemplate({
      componentEmitters,
    });

    return new Map([[fileName, replacedTemplate]]);
  },
};
