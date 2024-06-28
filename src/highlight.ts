import * as vscode from 'vscode';
import {parseString} from './prompts/parser';
import {getTagIndexCache, getTags} from "./autoCompile";
import {Prompt} from "./prompts/prompt";
import exp = require("constants");

export let lineDecorations = new Map<number, vscode.TextEditorDecorationType[]>();
export let lineTagInfos = new Map<number, Prompt>();

export let lintInFile = true;
export let lintColor: string = '';
const colorMap: string[] = [
  "#ffc93c",
  "#c264fe",
  "#95e1d3",
  "#eaffd0",
  "#fce38a",
  "#f38181",
  "#fcbad3",
  "#aa96da",
  "#ffffd2",
  "#a8d8ea",
  "#ff9a00",
  "#f73859",
];

export const getColorByLayer = (layer: number): string => {
  return colorMap[layer % colorMap.length];
};

export const withWaveUnderline = (color: string = "#f73859", style: "solid" | "double" | "dotted" | "dashed" | "wavy" = "wavy"): string => {
  return `;text-decoration-line: underline;text-decoration-style: ${style};text-decoration-color: ${color};`;
};

export const highlightColorByLayer = (layer: number, extraOptions?: vscode.DecorationRenderOptions, colorExt: string = ""): vscode.TextEditorDecorationType => {
  return vscode.window.createTextEditorDecorationType({
    color: getColorByLayer(layer) + colorExt,
    ...extraOptions
  });
};


export const setLintInFile = (lint: boolean) => {
  lintInFile = lint;
};
export const setLintColor = (color: string) => {
  lintColor = color;
};

export class DecorationWithRange {
  range: vscode.Range[];
  decoration: vscode.TextEditorDecorationType;

  constructor(public decorations: vscode.TextEditorDecorationType, public ranges: vscode.Range[]) {
    this.range = ranges;
    this.decoration = decorations;
  }
}

export const unloadDecorations = () => {
  console.log("unload decorations");
  for (let lineCtx of lineDecorations) {
    for (let i = 0; i < lineCtx[1].length; i++) {
      lineCtx[1][i].dispose();
    }
  }
  lineDecorations.clear();
};

export const unloadDecorationsByLine = (line: number): vscode.TextEditorDecorationType[] | undefined => {
  console.log("unload decorations by line", line);
  if (lineDecorations.has(line)) {
    const lineRst = lineDecorations.get(line);
    lineDecorations.delete(line);
    return lineRst;
  }
  return undefined;
};

const isExtFit = () => {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  let document = editor.document;
  return document.fileName.endsWith('.prompts');
};

export const assignDecorations = (line: number, decorations: DecorationWithRange[]) => {
  let editor = vscode.window.activeTextEditor!;
  if (!lineDecorations.has(line)) {
    lineDecorations.set(line, []);
  }
  for (let i = 0; i < decorations.length; i++) {
    let decoration = decorations[i].decoration;
    let ranges = decorations[i].range;
    editor.setDecorations(decoration, ranges);
    lineDecorations.get(line)!.push(decoration);
  }
};

export const assignPrompts = (line: number, prompt: Prompt) => {
  lineTagInfos.set(line, prompt);
};

export const unloadPrompts = () => {
  console.log("unload prompts");
  lineTagInfos = new Map<number, Prompt>();
};
export const unloadPromptsByLine = (line: number): Prompt | undefined => {
  console.log("unload prompts by line", line);
  if (lineTagInfos.has(line)) {
    const lineRst = lineTagInfos.get(line);
    lineTagInfos.delete(line);
    return lineRst;
  }
  return undefined;
};

export const getPromptsByLine = (line: number): Prompt | undefined => {
  return lineTagInfos.get(line);
};


const highlightByLine = (line: number, ignoreCheck: boolean = false) => {
  console.log("highlightByLine", line);
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;
  if (!ignoreCheck && document.validateRange(new vscode.Range(line, 0, line, 1)).end.character !== 1) {
    console.warn("line is empty at ", line);
    return;
  }
  let text = document.lineAt(line).text;
  if (!text.trim()) {
    return;
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
    assignDecorations(line, [decorations]);
    return;
  }

  let lineParts = text.split("|");
  let nameEndPos = 0;
  let tags = text;
  if (lineParts.length >= 2) {
    nameEndPos = lineParts[0].length + 1;
    tags = lineParts.slice(1).join("|");
  }

  let result: DecorationWithRange[] = [];

  let tagParts = Prompt.fromString(tags);
  tagParts.setLine(line);
  tagParts.calculate(nameEndPos, 0);
  tagParts.gatherDecos(result);
  // console.log("after_calc", tagParts);

  assignDecorations(line, result);
  assignPrompts(line, tagParts);
};

export const highlightFullProvider = () => {
  console.log("highlightFullProvider trigger");
  if (!isExtFit()) {
    return;
  }
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;
  unloadDecorations();
  unloadPrompts();
  for (let i = 0; i < document.lineCount; i++) {
    highlightByLine(i);
  }
};

const getAffectLines = (s: Record<number, boolean>, changeRange: vscode.Range, text: string): Record<number, boolean> => {
  let lineCount = text.split('\n').length - 1;
  let removedCount = changeRange.end.line - changeRange.start.line;
  if (removedCount > 0) {
    let patched: Record<number, boolean> = {};
    for (let k in s) {
      let n = parseInt(k);
      n = n > changeRange.start.line ? n - 1 : n;
      patched[n] = s[k];
    }
    s = patched;
  }
  if (lineCount > 0) {
    let patched: Record<number, boolean> = {};
    for (let k in s) {
      let n = parseInt(k);
      n = n < changeRange.start.line ? n : n + lineCount;
      patched[n] = s[k];
    }
    s = patched;
  }
  for (let i = changeRange.start.line; i <= changeRange.end.line + lineCount; i++) {
    s[i] = s[i] || i <= changeRange.start.line + lineCount;
  }
  console.log("affectLines", changeRange.start, changeRange.end, text, "=>", s);
  return s;
};

export const highlightLineProvider = (e: vscode.TextDocumentChangeEvent) => {
  console.log("highlightLineProvider trigger", e);
  if (!isExtFit()) {
    return;
  }
  let diffLineMap: Record<number, boolean> = {};
  e.contentChanges.forEach(change => {
    diffLineMap = getAffectLines(diffLineMap, change.range, change.text);
  });
  let diffLineSet: number[] = Object.keys(diffLineMap).map(i => parseInt(i)).sort((a, b) => b - a);
  let lineExist = false;
  console.log("affectLines", diffLineSet);
  for (let line = diffLineSet[0]; line >= diffLineSet[diffLineSet.length - 1]; line--) {
    console.log("process", line);
    let unloadLines = unloadDecorationsByLine(line);
    unloadPromptsByLine(line);
    if (diffLineMap[line] || lineExist) {
      lineExist = true;
    }
    highlightByLine(line, lineExist);
    unloadLines?.forEach(decoration => {
      decoration.dispose();
    });
  }
};