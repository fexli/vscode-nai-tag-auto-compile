import vscode from "vscode";
import {loadTags} from "../autoCompile";
import {highlightFullProvider, setLintInFile} from "../highlight";

export let tagsFile: string | undefined;
export let highlightInFile: boolean | undefined;


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
};