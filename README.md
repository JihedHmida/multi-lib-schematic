# jh-multi-lib-schematic

[![npm version](https://badge.fury.io/js/jh-multi-lib-schematic.svg)](https://badge.fury.io/js/jh-multi-lib-schematic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**jh-multi-lib-schematic** is an Angular schematic designed to quickly scaffold modular multi-library Angular projects with configurable suffix generation and global schematic settings.

---

## Features

- Creates a modular library structure with proper prefixes and path aliases.
- Applies global schematic configurations for components, services, pipes, guards, directives, and more.
- Updates `tsconfig.json` paths automatically to reflect new libraries.
- Optional suffix generation for Angular schematic artifacts like `Component`, `Service`, etc.
- Customizable schematic behavior via CLI flags.

---

## Installation

Install via npm and add to your Angular workspace:

```bash
ng add jh-multi-lib-schematic
```

---

## Usage

Customize the schematic behavior using the following parameter:

| Parameter           | Type    | Description                                                                                             | Default |
|---------------------|---------|---------------------------------------------------------------------------------------------------------|---------|
| `--generateSuffixes` | boolean | If true, generated Angular schematics will include suffixes (e.g., Component, Service). If false, suffixes are omitted. | false   |

### Example:

```bash
ng add jh-multi-lib-schematic --generateSuffixes
```

If you omit the flag, suffixes will not be added by default.

---

## What happens after running?

- Modular library structure created with proper prefixes and aliases.
- Global schematics configuration applied for components, services, pipes, guards, interceptors, directives, and more.
- `tsconfig.json` paths updated to reflect the new libraries.
- Optionally, suffixes appended to generated schematic artifacts if `--generateSuffixes` is true.

---

## Contributing

Feel free to fork the repository and submit pull requests for improvements or new features.

---

## License

MIT License

---

## Support

If you have any questions or issues, please open an issue on GitHub or contact the author directly.