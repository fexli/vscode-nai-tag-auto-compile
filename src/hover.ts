import vscode from "vscode";
import {getTags, getTagIndexCache} from "./autoCompile";
import {getPromptsByLine} from "./highlight";
import {buildPlaceholderPromptWiki, buildUnknownWiki} from "./prompts/wikiBuilder";

export const disposableHover = vscode.languages.registerHoverProvider({pattern: '**/*.prompts'}, {
  provideHover(document, position, token) {
    console.log("provideHover trigger");
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let promptInfo = getPromptsByLine(document.fileName, position.line);
    console.log("provideHover promptInfo", promptInfo);
    if (!promptInfo) {
      return;
    }
    let promptRange = promptInfo.getPromptAt(position.character);
    console.log("provideHover promptRange", promptRange);
    if (!promptRange.matched) {
      return;
    }
    if (promptRange.prompt === "-") {
      return new vscode.Hover(
        ["\\" + promptRange.prompt, buildPlaceholderPromptWiki()],
        promptRange.range,
      );
    }

    let promptIndex = getTagIndexCache()[promptRange.prompt];

    if (promptIndex == undefined && promptRange.prompt.startsWith("artist:")) {
      promptIndex = getTagIndexCache()[promptRange.prompt.slice(7)];
    }

    if (promptIndex !== undefined) {
      return new vscode.Hover(
        [promptRange.prompt, getTags()[promptIndex].wiki_markdown!],
        promptRange.range,
      );
    }
    const vsm = new vscode.MarkdownString(
      promptRange.replacedWiki ? promptRange.replacedWiki : buildUnknownWiki(),
    );
    vsm.supportHtml = true;
    vsm.isTrusted = true;
    return new vscode.Hover(
      [promptRange.prompt, vsm],
      promptRange.range,
    );
  }
});