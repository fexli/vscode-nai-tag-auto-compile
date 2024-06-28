import * as vscode from 'vscode';
import {parseString} from './prompts/parser';
import {getTagIndexCache, getTags} from "./autoCompile";
import {Prompt} from "./prompts/prompt";
import exp = require("constants");

let lineDecorations = new Map<number, vscode.TextEditorDecorationType[]>();

let lintInFile = true;
let lintColor: string = 'rgb(255,202,32)';
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
  for (let lineCtx of lineDecorations) {
    for (let i = 0; i < lineCtx[1].length; i++) {
      lineCtx[1][i].dispose();
    }
  }
  lineDecorations.clear();
};

export const unloadDecorationsByLine = (line: number): vscode.TextEditorDecorationType[] | undefined => {
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

const highlightByLine = (line: number) => {
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;

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
  console.log("after_calc", tagParts);

  // let ranges: vscode.Range[] = [];
  // let current_idx = text.indexOf(tags);
  // for (let tag of tagParts) {
  //   let tagIndex = current_idx + tag.length;
  //   if (tagIndex >= 0) {
  //     let start = new vscode.Position(line, current_idx);
  //     let end = new vscode.Position(line, tagIndex);
  //     let range = new vscode.Range(start, end);
  //     let tagStr = tag.trim().replaceAll(" ", "_");
  //     ranges.push(range);
  //     current_idx = tagIndex + 1;
  //     if (lintInFile && getTagIndexCache()[tagStr] !== undefined) {
  //       let decoData = new DecorationWithRange(vscode.window.createTextEditorDecorationType({
  //         // 创建一个圆角3px的显示createTextEditorDecorationType
  //         before: {
  //           contentText: getTags()[getTagIndexCache()[tagStr]].name_zh.split("（")[0],
  //           backgroundColor: 'rgba(0,0,0,0);font-size:10px;position: absolute;top: -8px',
  //           color: lintColor,
  //         },
  //       }), [range]);
  //       result.push(decoData);
  //     }
  //   }
  // }
  // let decoration = vscode.window.createTextEditorDecorationType({
  //   color: 'rgb(62,180,179)'
  // });
  // let decorations = new DecorationWithRange(decoration, ranges);
  // result.push(decorations);

  assignDecorations(line, result);
};

export const highlightFullProvider = () => {
  if (!isExtFit()) {
    return;
  }
  let editor = vscode.window.activeTextEditor!;
  let document = editor.document;
  unloadDecorations();
  for (let i = 0; i < document.lineCount; i++) {
    highlightByLine(i);
  }
};

export const highlightLineProvider = (e: vscode.TextDocumentChangeEvent) => {
  if (!isExtFit()) {
    return;
  }
  let multilineChanged = false
  for (let change of e.contentChanges) {
    let lineCount = change.text.split('\n').length;
    if (lineCount !== 1 || change.range.start.line !== change.range.end.line) {
      multilineChanged = true;
      break;
    }
  }
  let editor = vscode.window.activeTextEditor!;
  if (multilineChanged) {
    let document = editor.document;
    unloadDecorations();
    for (let i = 0; i < document.lineCount; i++) {
      highlightByLine(i);
    }
    return;
  }
  let section = editor.selection;

  let unloadLines = unloadDecorationsByLine(section.active.line);
  highlightByLine(section.active.line);
  unloadLines?.forEach(decoration => {
    decoration.dispose();
  });
};