import * as vscode from 'vscode';
import {parseString} from './prompts/parser';

let lineDecorations: vscode.TextEditorDecorationType[] = [];

class DecorationWithRange {
  range: vscode.Range[];
  decoration: vscode.TextEditorDecorationType;

  constructor(public decorations: vscode.TextEditorDecorationType, public ranges: vscode.Range[]) {
    this.range = ranges;
    this.decoration = decorations;
  }
}

export const unloadDecorations = () => {
  for (let i = 0; i < lineDecorations.length; i++) {
    lineDecorations[i].dispose();
  }
  lineDecorations = [];
};

const isExtFit = () => {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  let document = editor.document;
  return document.fileName.endsWith('.tags');
};

export const assignDecorations = (decorations: DecorationWithRange[]) => {
  let editor = vscode.window.activeTextEditor!;

  for (let i = 0; i < decorations.length; i++) {
    let decoration = decorations[i].decoration;
    let ranges = decorations[i].range;
    editor.setDecorations(decoration, ranges);
    lineDecorations.push(decoration);
  }
};

export const highlightProvider = () => {
  if (!isExtFit()) {
    return;
  }
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;

  unloadDecorations();
  for (let line = 0; line < document.lineCount; line++) {
    let text = document.lineAt(line).text;

    if (!text.trim()) {
      continue;
    }
    if (text.trim().startsWith("#")) {
      let decoration = vscode.window.createTextEditorDecorationType({
        color: 'rgb(103,103,103)'
      });
      let ranges: vscode.Range[] = [];
      ranges.push(new vscode.Range(
        new vscode.Position(line, 0),
        new vscode.Position(line, text.length)
      ));
      let decorations = new DecorationWithRange(decoration, ranges);
      assignDecorations([decorations]);
      continue;
    }

    let lineParts = text.split("|");
    let name = "";
    let tags = text;
    if (lineParts.length >= 2) {
      name = lineParts[0];
      tags = lineParts.slice(1).join("|");
    }

    let tagParts = parseString(tags, ",");
    let ranges: vscode.Range[] = [];

    let current_idx = text.indexOf(tags);
    for (let tag of tagParts) {
      let tagIndex = current_idx + tag.length;
      if (tagIndex >= 0) {
        let start = new vscode.Position(line, current_idx);
        let end = new vscode.Position(line, tagIndex);
        ranges.push(new vscode.Range(start, end));
        current_idx = tagIndex + 1;
      }
    }

    let decoration = vscode.window.createTextEditorDecorationType({
      color: 'rgb(62,180,179)'
    });
    let decorations = new DecorationWithRange(decoration, ranges);
    assignDecorations([decorations]);
  }
};