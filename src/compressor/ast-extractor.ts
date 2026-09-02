import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

export interface ASTExtractionResult {
  filePath?: string;
  typeSkeleton: string;
  originalLength: number;
  skeletonLength: number;
  originalLineCount: number;
  skeletonLineCount: number;
}

export class ASTExtractor {
  /**
   * Extracts type skeletons from a TypeScript/JavaScript source file on disk.
   */
  public static extractFromFile(filePath: string): ASTExtractionResult {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }
    const sourceCode = fs.readFileSync(absolutePath, 'utf8');
    const result = this.extractFromString(sourceCode, path.basename(absolutePath));
    return {
      ...result,
      filePath: absolutePath
    };
  }

  /**
   * Parses source code and generates a synthetic .d.ts style skeleton.
   */
  public static extractFromString(sourceCode: string, fileName: string = 'module.ts'): ASTExtractionResult {
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );

    const skeletonParts: string[] = [];

    const printNode = (node: ts.Node): string => {
      const printer = ts.createPrinter({ removeComments: false });
      return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
    };

    ts.forEachChild(sourceFile, (node) => {
      // 1. Interfaces
      if (ts.isInterfaceDeclaration(node)) {
        skeletonParts.push(printNode(node));
      }
      // 2. Type Aliases
      else if (ts.isTypeAliasDeclaration(node)) {
        skeletonParts.push(printNode(node));
      }
      // 3. Enum Declarations
      else if (ts.isEnumDeclaration(node)) {
        skeletonParts.push(printNode(node));
      }
      // 4. Function Declarations (Strip body)
      else if (ts.isFunctionDeclaration(node)) {
        const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        const name = node.name ? node.name.text : 'anonymous';
        const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => printNode(p)).join(', ')}>` : '';
        const params = node.parameters.map(p => printNode(p)).join(', ');
        const returnType = node.type ? `: ${printNode(node.type)}` : ': any';
        const exportPrefix = isExported ? 'export declare function ' : 'declare function ';
        
        skeletonParts.push(`${exportPrefix}${name}${typeParams}(${params})${returnType};`);
      }
      // 5. Class Declarations (Strip method & constructor bodies, keep signatures & properties)
      else if (ts.isClassDeclaration(node)) {
        const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        const name = node.name ? node.name.text : 'AnonymousClass';
        const heritage = node.heritageClauses ? ` ${node.heritageClauses.map(h => printNode(h)).join(' ')}` : '';
        const exportPrefix = isExported ? 'export class ' : 'class ';

        const members: string[] = [];
        for (const member of node.members) {
          if (ts.isPropertyDeclaration(member)) {
            const memberModifiers = member.modifiers ? member.modifiers.map(m => printNode(m)).join(' ') + ' ' : '';
            const propName = printNode(member.name);
            const propType = member.type ? `: ${printNode(member.type)}` : '';
            members.push(`  ${memberModifiers}${propName}${propType};`);
          } else if (ts.isConstructorDeclaration(member)) {
            const params = member.parameters.map(p => printNode(p)).join(', ');
            members.push(`  constructor(${params});`);
          } else if (ts.isMethodDeclaration(member)) {
            const memberModifiers = member.modifiers ? member.modifiers.map(m => printNode(m)).join(' ') + ' ' : '';
            const methodName = printNode(member.name);
            const typeParams = member.typeParameters ? `<${member.typeParameters.map(p => printNode(p)).join(', ')}>` : '';
            const params = member.parameters.map(p => printNode(p)).join(', ');
            const returnType = member.type ? `: ${printNode(member.type)}` : ': any';
            members.push(`  ${memberModifiers}${methodName}${typeParams}(${params})${returnType};`);
          }
        }

        skeletonParts.push(`${exportPrefix}${name}${heritage} {\n${members.join('\n')}\n}`);
      }
      // 6. Variable Statement (exported const/let type signatures)
      else if (ts.isVariableStatement(node)) {
        const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
        for (const decl of node.declarationList.declarations) {
          const varName = printNode(decl.name);
          const varType = decl.type ? `: ${printNode(decl.type)}` : '';
          const exportPrefix = isExported ? 'export declare const ' : 'declare const ';
          skeletonParts.push(`${exportPrefix}${varName}${varType};`);
        }
      }
      // 7. Import declarations (keep only imports of types / dependencies)
      else if (ts.isImportDeclaration(node)) {
        skeletonParts.push(printNode(node));
      }
    });

    const typeSkeleton = skeletonParts.join('\n\n');
    const originalLineCount = sourceCode.split('\n').length;
    const skeletonLineCount = typeSkeleton ? typeSkeleton.split('\n').length : 0;

    return {
      typeSkeleton,
      originalLength: sourceCode.length,
      skeletonLength: typeSkeleton.length,
      originalLineCount,
      skeletonLineCount
    };
  }
}
