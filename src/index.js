// @flow
import { LanguageClient, workspace, services, ExtensionContext } from 'coc.nvim';
import fs from 'fs';
import path from 'path';

type Config = {|
  +enable: boolean,
  +pathToFlow: string,
|};

const getFlowCommand = (config: Config): string => {
  const defaultFlowBinPath = path.join(workspace.rootPath, 'node_modules', '.bin', 'flow');
  if (fs.existsSync(defaultFlowBinPath)) {
    return defaultFlowBinPath;
  }

  return config.pathToFlow;
};

exports.activate = (context: ExtensionContext) => {
  const flowConfigPath = path.join(workspace.rootPath, '.flowconfig');
  const config: Config = workspace.getConfiguration().get('flow', {});

  if (!fs.existsSync(flowConfigPath) || config.enable === false) {
    return;
  }

  const command = getFlowCommand(config);
  const serverOptions = { command, args: ['lsp'] };

  const documentSelector = ['javascript', 'javascriptreact'].reduce(
    (prev, language) => [...prev, { language, scheme: 'file' }, { language, scheme: 'untitled' }],
    [],
  );

  const clientOptions = {
    documentSelector,
  };

  const languageClient = new LanguageClient('flow', 'Flow', serverOptions, clientOptions);
  context.subscriptions.push(services.registLanguageClient(languageClient));
};
