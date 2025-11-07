/*
  @license
	Rollup.js v4.53.0
	Fri, 07 Nov 2025 16:21:34 GMT - commit ecff5325941ec36599f9967731ed6871186a72ee

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
