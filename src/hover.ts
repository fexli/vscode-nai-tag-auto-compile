import vscode from "vscode";

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
      if (range.start.character < nameIdx){
        return new vscode.Hover(
          [document.getText(range), "Name defs"],
          range,
        );
      }
      return new vscode.Hover(
        [document.getText(range), "Tag info"],
        range,
      );
    }
  }
});