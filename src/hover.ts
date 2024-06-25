import vscode from "vscode";
import {getTags, getTagIndexCache} from "./autoCompile";

export const disposableHover = vscode.languages.registerHoverProvider({pattern: '**/*.tags'}, {
  provideHover(document, position, token) {
    let range = document.getWordRangeAtPosition(
      position, /[!-#%'-+\--Z^-~][!-+\--~]+[!-#%'-+\--Z^-~]|[!-#%'-+\--Z^-~]/g
    );
    if (range) {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      let section = editor.selection;
      let text = document.lineAt(range.start.line).text;
      if (text.startsWith("#")) {
        return;
      }
      let lineParts = text.split("|");
      let nameIdx = 0;
      if (lineParts.length >= 2) {
        nameIdx = lineParts[0].length;
      }
      if (range.start.character < nameIdx) {
        return new vscode.Hover(
          ["_@Name defs_", document.getText(range)],
          range,
        );
      }
      let currentTag = document.getText(range);
      if (getTagIndexCache()[currentTag] !== undefined) {
        return new vscode.Hover(
          [currentTag, getTags()[getTagIndexCache()[currentTag]].wiki_markdown!],
          range,
        );
      }
      const vsm = new vscode.MarkdownString("<font color=\"gray\">未找到Wiki</font>");
      vsm.supportHtml = true;
      return new vscode.Hover(
        [currentTag, vsm],
        range,
      );
    }
  }
});