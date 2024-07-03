import vscode from "vscode";
import {getTags, getTagIndexCache} from "./autoCompile";
import {getPromptsByLine} from "./highlight";
import {buildPlaceholderPromptWiki} from "./prompts/wikiBuilder";

export const disposableHover = vscode.languages.registerHoverProvider({pattern: '**/*.prompts'}, {
  provideHover(document, position, token) {
    console.log("provideHover trigger");
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let promptInfo = getPromptsByLine(position.line);
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

    const promptIndex = getTagIndexCache()[promptRange.prompt.replaceAll(" ", "_")];

    if (promptIndex !== undefined) {
      return new vscode.Hover(
        [promptRange.prompt, getTags()[promptIndex].wiki_markdown!],
        promptRange.range,
      );
    }
    const vsm = new vscode.MarkdownString(
      promptRange.replacedWiki ? promptRange.replacedWiki : "<span style=\"color:#e84a5f;background-color:#0000;\">未找到Wiki</span>"
    );
    vsm.supportHtml = true;
    vsm.isTrusted = true;
    return new vscode.Hover(
      [promptRange.prompt, vsm],
      promptRange.range,
    );
  }
});