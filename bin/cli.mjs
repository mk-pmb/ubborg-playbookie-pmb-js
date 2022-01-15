// -*- coding: utf-8, tab-width: 2 -*-

import 'usnam-pmb';
import 'p-fatal';

import impl from '../src/cliTranslateFile.mjs';

impl.runFromCli(...process.argv.slice(2));
