import {Prompt} from "../prompt";
import {DecorationWithRange, highlightColorByLayer} from "../../highlight";
import * as vscode from "vscode";


export interface PromptBaseInterface {
  calculate(startPos: number, layer: number): number;

  setLine(line: number): void;

  gatherDecos(decos: DecorationWithRange[]): void;

  // getPromtAt(pos: number): string;
}

export class SimplePrompt implements PromptBaseInterface {
  prompt: string;
  startPos: number;
  endPos: number;
  layer: number;
  line: number;

  constructor(prompt: string) {
    this.prompt = prompt;
    this.startPos = this.endPos = this.layer = this.line = 0;
  }

  setLine(line: number) {
    this.line = line;
  }

  // 计算prompt位置和节点的迭代层数
  calculate(startPos: number, layer: number): number {
    this.startPos = startPos;
    this.endPos = startPos + this.prompt.length;
    this.layer = layer;
    return this.prompt.length;
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      highlightColorByLayer(this.layer),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      )]
    ));
  }


  static fromString(fr: string): SimplePrompt {
    return new SimplePrompt(fr);
  }

}