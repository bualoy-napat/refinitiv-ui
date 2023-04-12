#!/usr/bin/env node
/**
 * Generic configuration for web-server.
 * Extend as required
 */
import { ROOT } from './scripts/helpers/esm.mjs';

export default {
  rootDir: ROOT,
  open: true,
  watch: false,
  nodeResolve: true,
  preserveSymlinks: true,
  appIndex: '/',
};