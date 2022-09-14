#!/usr/bin/env -S ts-node --files

import * as path from "path";
import {
  ClassExpression,
  ConstructorDeclaration,
  ObjectBindingPattern,
  ParameterDeclaration,
  Project,
  SourceFile,
  Statement,
  StructureKind,
  SyntaxKind, TypeLiteralNode
} from "ts-morph";

async function main() {
  console.log('Starting magic script to transform model file into sexy usecase file');

  try {
    const filePath = process.argv[2];
    console.log({filePath});

    console.log('Reading file... ');

    const project = new Project({
      tsConfigFilePath: path.join(__dirname, '..', '..', 'tsconfig.json'),
    });
    const sourceFile: SourceFile = project.addSourceFileAtPath(filePath);
    const statements: Statement[] = sourceFile.getStatements();
    const statement = statements.find(statement => statement.getKind() === SyntaxKind.ExpressionStatement);
    const classExpression = statement?.getDescendantsOfKind(SyntaxKind.ClassExpression)[0] as ClassExpression;
    const classExpressionConstructor = classExpression.getMembers().find(member => member.getKind() === SyntaxKind.Constructor) as ConstructorDeclaration;
    const constructorParameter = classExpressionConstructor.getParameters()[0] as ParameterDeclaration;
    const parameters = constructorParameter.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern) as ObjectBindingPattern;
    const elements = parameters.getElements();

    sourceFile.addTypeAlias({
      type: `{\n${elements.map(element => `${element.getName()}: unknown;`).join('\n')}\n}`,
      name: `${classExpression.getName()}OptionsType`,
      isExported: true,
    });

    await project.save();

    console.log('\nDone.');
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
