import * as vscode from "vscode";
import {trim} from "../prompts/parser";

export const tagsAutoCompileProvider = vscode.languages.registerCompletionItemProvider({pattern: '**/*.tags'}, {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionList<vscode.CompletionItem> {
    const wordRange = document.getWordRangeAtPosition(
      position, /[a-zA-Z0-9_:()\[\]\\\/\-!@#$%^*.【】]+/gm
    );
    let word = document.getText(wordRange);
    let rr: vscode.CompletionItem[] = [];

    let cmp = new vscode.CompletionItem("补全定义头", vscode.CompletionItemKind.Snippet);
    cmp.filterText = word;
    cmp.sortText = word;
    let names = document.fileName.split("figured");
    let name = trim(names[names.length - 1].replaceAll("/", ".").replaceAll(".tags", ""), " /.");

    cmp.insertText = `** Prompt=${name}\n** Desc=`
    cmp.range = wordRange;
    rr.push(cmp);
    return new vscode.CompletionList(rr, true);
  },
}, '*');
