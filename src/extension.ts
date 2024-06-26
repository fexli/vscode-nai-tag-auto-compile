import * as vscode from 'vscode';
import {unloadTags, autoCompileProvider} from './autoCompile';
import {unloadDecorations, highlightFullProvider, highlightLineProvider} from './highlight';
import {disposableHover} from "./hover";
import {loadConfigs} from "./config/loader";

export function activate(context: vscode.ExtensionContext) {
  // tags autocompiler setting
  // 加载使用设置：tags.tagsFile
  loadConfigs();
  context.subscriptions.push(autoCompileProvider);

  // highlight setting
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(highlightFullProvider));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(highlightLineProvider));
  highlightFullProvider();

  // hover setting
  context.subscriptions.push(disposableHover);

  // 检查设置被更新
  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('tags')) {
      loadConfigs();
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {
  unloadTags();
  unloadDecorations();
}
