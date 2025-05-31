import {
  chain,
  externalSchematic,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
const LIBRARIES = [
  { name: 'core', prefix: 'lib', alias: '@core/*', importPath: 'source-glob' },
  { name: 'ui', prefix: 'ui', alias: '@ui/*', importPath: 'source-glob' },
  { name: 'utils', prefix: 'lib', alias: '@utils/*', importPath: 'source-glob' },
  { name: 'features', prefix: 'page', alias: '@features/*', importPath: 'source-glob', skipSelector: true },
  { name: 'data-models', prefix: 'lib', alias: '@data-models', importPath: 'public-api', skipSelector: true },
  { name: 'data-services', prefix: 'lib', alias: '@data-services', importPath: 'public-api', skipSelector: true },
];
function getSchematicsConfig(skipSelector: boolean, shouldAddSuffixes: boolean) {
  return {
    '@schematics/angular:component': {
      style: 'scss',
      inlineStyle: true,
      skipTests: true,
      changeDetection: 'OnPush',
      ...(shouldAddSuffixes ? { type: 'component' } : {}),
      ...(skipSelector ? { skipSelector: true } : {}),
    },
    '@schematics/angular:pipe': {
      skipTests: true,
    },
    '@schematics/angular:resolver': {
      skipTests: true,
      functional: true,
    },
    '@schematics/angular:service': {
      skipTests: true,
      ...(shouldAddSuffixes ? { type: 'service' } : {}),
    },
    '@schematics/angular:guard': {
      skipTests: true,
      functional: true,
    },
    '@schematics/angular:interceptor': {
      skipTests: true,
      functional: true,
    },
    '@schematics/angular:directive': {
      skipTests: true,
      ...(shouldAddSuffixes ? { type: 'directive' } : {}),
    },
  };
}

export function ngAdd(options: { generateSuffixes?: boolean }): Rule {
  const shouldAddSuffixes = options.generateSuffixes === true;

  return (_tree: Tree, _context: SchematicContext) => {
    return chain([
      updateNewProjectRoot(),
      ...LIBRARIES.map(createLibrary),
      setLibrarySchematics(shouldAddSuffixes),
      updateTsconfigPaths(),
    ]);
  };
}
function updateNewProjectRoot(): Rule {
  return (tree: Tree) => {
    const configPath = '/angular.json';
    if (!tree.exists(configPath)) {
      throw new SchematicsException('Could not find angular.json');
    }

    const buffer = tree.read(configPath);
    if (!buffer) {
      throw new SchematicsException('Could not read angular.json');
    }

    const content = buffer.toString();
    const json = JSON.parse(content);
    json.newProjectRoot = 'libs';

    tree.overwrite(configPath, JSON.stringify(json, null, 2));
    return tree;
  };
}

function createLibrary(lib: { name: string; prefix: string }): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'library', {
      name: lib.name,
      prefix: lib.prefix,
    }),
    cleanupSingleLibrary(lib.name),
  ]);
}
function cleanupSingleLibrary(libName: string): Rule {
  return (tree: Tree) => {
    const basePath = `libs/${libName}/src`;

    const libDir = `${basePath}/lib`;
    tree.getDir(libDir).visit((filePath) => {
      if (tree.exists(filePath)) {
        tree.delete(filePath);
      }
    });

    const publicApiPath = `${basePath}/public-api.ts`;
    if (tree.exists(publicApiPath)) {
      tree.overwrite(publicApiPath, '');
    }

    return tree;
  };
}
function setLibrarySchematics(shouldAddSuffixes: boolean): Rule {
  return (tree: Tree) => {
    const configPath = '/angular.json';
    const buffer = tree.read(configPath);
    if (!buffer) return tree;

    const json = JSON.parse(buffer.toString());

    for (const lib of LIBRARIES) {
      const project = json.projects[lib.name];
      if (!project) continue;

      project.schematics = getSchematicsConfig(!!lib.skipSelector, shouldAddSuffixes);
    }

    tree.overwrite(configPath, JSON.stringify(json, null, 2));
    return tree;
  };
}

function updateTsconfigPaths(): Rule {
  return (tree: Tree) => {
    const path = 'tsconfig.json';
    if (!tree.exists(path)) return tree;

    let content = tree.read(path)!.toString();
    content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

    let tsconfig;
    try {
      tsconfig = JSON.parse(content);
    } catch (error) {
      throw new SchematicsException(`Failed to parse tsconfig.json: ${error}`);
    }

    tsconfig.compilerOptions = tsconfig.compilerOptions || {};
    tsconfig.compilerOptions.paths = {};

    for (const lib of LIBRARIES) {
      if (!lib.alias || !lib.importPath) continue;

      let resolvedPath: string;

      switch (lib.importPath) {
        case 'public-api':
          resolvedPath = `./libs/${lib.name}/src/public-api.ts`;
          break;
        case 'source-glob':
          resolvedPath = `./libs/${lib.name}/src/lib/*`;
          break;
        default:
          throw new Error(`Unsupported importPath strategy: ${lib.importPath}`);
      }

      tsconfig.compilerOptions.paths[lib.alias] = [resolvedPath];
    }

    tree.overwrite(path, JSON.stringify(tsconfig, null, 2));
    return tree;
  };
}
