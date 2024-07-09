import {
  DecorationWithRange,
  getColorByLayer,
  highlightColorByLayer,
  lintColor,
  lintInFile,
  withWaveUnderline
} from "../../highlight";
import * as vscode from "vscode";
import {getTagIndexCache, getTags} from "../../autoCompile";

export type PromptRange = {
  matched: boolean;
  prompt: string;
  replacedWiki: string;
  range: vscode.Range | undefined;
};

export interface PromptBaseInterface {
  calculate(startPos: number, layer: number): number;

  setLine(line: number): void;

  dump(withEmpty: boolean): string;

  gatherDecos(decos: DecorationWithRange[]): void;

  getPromptAt(pos: number): PromptRange;

  getStartPos(): number;

  getEndPos(): number;
}

export class SimplePrompt implements PromptBaseInterface {
  prompt: string;
  startPos: number;
  endPos: number;
  layer: number;
  line: number;
  beforeEmpty: number;
  afterEmpty: number;

  constructor(prompt: string) {
    this.prompt = prompt;
    this.startPos = this.endPos = this.layer = this.line = 0;
    this.beforeEmpty = this.afterEmpty = 0; // 节省计算资源，减少计算量
  }

  setLine(line: number) {
    this.line = line;
  }

  // 计算prompt位置和节点的迭代层数
  calculate(startPos: number, layer: number): number {
    this.startPos = startPos + this.beforeEmpty;
    this.endPos = this.startPos + this.prompt.length;
    this.layer = layer;
    return this.prompt.length + (this.beforeEmpty + this.afterEmpty);
  }

  gatherDecos(decos: DecorationWithRange[]) {
    const range = new vscode.Range(
      new vscode.Position(this.line, this.startPos),
      new vscode.Position(this.line, this.endPos)
    );
    let extra: any = {};
    let prompt = this.prompt;
    if (this.prompt.startsWith("artist:")) {
      prompt = prompt.replace("artist:", "");
    }
    prompt = prompt.toLowerCase().replaceAll(" ", "_");

    let tagIndex = getTagIndexCache()[prompt];
    let aext = ""
    if (tagIndex != undefined) {
      if (lintInFile) {
        extra = {
          // 创建一个圆角3px的显示createTextEditorDecorationType
          before: {
            contentText: getTags()[tagIndex].name_zh.split("（")[0],
            backgroundColor: 'rgba(0,0,0,0);font-size:9px;position: absolute;top: -8.5px',
            color: lintColor ? lintColor : getColorByLayer(this.layer),
          },
        };
      }
      if (getTags()[tagIndex].type_n === 1) {
        // extra.backgroundColor = 'rgba(69,93,122,0.7)';
        aext = withWaveUnderline("rgb(94,150,217)", "dotted");
      }
    }
    decos.push(new DecorationWithRange(
      highlightColorByLayer(
        this.layer, extra,
        tagIndex == undefined && this.prompt !== "-" && !this.prompt.startsWith("artist:") ? withWaveUnderline("#f73859", "dotted") : aext
      ),
      [range]
    ));
  }

  static fromString(fr: string): SimplePrompt {
    let beforeEmpty = 0;
    let afterEmpty = 0;
    // trimEmpty
    while (fr.length) {
      if (fr[0] === ' ') {
        beforeEmpty++;
        fr = fr.substring(1);
        continue;
      }
      if (fr[fr.length - 1] === ' ') {
        afterEmpty++;
        fr = fr.substring(0, fr.length - 1);
        continue;
      }
      break;
    }

    const data = new SimplePrompt(fr);
    data.beforeEmpty = beforeEmpty;
    data.afterEmpty = afterEmpty;
    return data;
  }

  getPromptAt(pos: number): PromptRange {
    const matched = this.startPos <= pos && pos <= this.endPos;
    let prompt = "";
    if (matched) {
      if (this.prompt.startsWith("artist:")) {
        prompt = this.prompt.replaceAll("artist:", "");
      } else {
        prompt = this.prompt;
      }
      prompt = prompt.toLowerCase().replaceAll(" ", "_");
    }
    return {
      matched: matched,
      prompt: matched ? prompt : '',
      replacedWiki: "",
      range: matched ? new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      ) : undefined
    };
  }

  getStartPos(): number {
    return this.startPos;
  }

  getEndPos(): number {
    return this.endPos;
  }

  dump(withEmpty: boolean = false): string {
    if (withEmpty) {
      return " ".repeat(this.beforeEmpty) + this.prompt + " ".repeat(this.afterEmpty);
    }
    return this.prompt;
  }
}