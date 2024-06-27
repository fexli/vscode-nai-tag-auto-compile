import vscode from "vscode";
import {loadTags} from "../autoCompile";
import {highlightFullProvider, setLintColor, setLintInFile} from "../highlight";

export let tagsFile: string | undefined;
export let highlightInFile: boolean | undefined;
export let highlightColor: string | undefined;


export const loadConfigs = () => {
  const config = vscode.workspace.getConfiguration('tags');
  tagsFile = config.get<string>('tagsFile');
  if (tagsFile != undefined) {
    loadTags(tagsFile);
  }

  highlightInFile = config.get<boolean>('lintInFile');
  if (highlightInFile != undefined) {
    setLintInFile(highlightInFile);
  }

  highlightColor = config.get<string>('lintColor');
  if (highlightColor != undefined) {
    setLintColor(highlightColor);
  }
};