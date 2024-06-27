import {PromptBaseInterface, SimplePrompt} from "./simple";
import {parseString} from "../parser";
import {Prompt} from "../prompt";
import {DecorationWithRange, highlightColorByLayer} from "../../highlight";
import * as vscode from "vscode";

export class RandomPrompt extends SimplePrompt implements PromptBaseInterface {
  prompts: PromptBaseInterface[];
  slicer: number[];

  constructor() {
    super("");
    this.prompts = [];
    this.slicer = [];
  }

  calculate(startPos: number, layer: number): number {
    this.startPos = startPos;
    this.layer = layer;
    let nextStart = startPos + 1;
    for (let i = 0; i < this.prompts.length; i++) {
      const prompt = this.prompts[i];
      let len = prompt.calculate(nextStart, layer + 1);
      nextStart += len + 2; // '&&'
      this.slicer.push(nextStart - 2);
    }
    if (this.slicer.length>0){
      this.slicer.pop();
    }
    this.endPos = nextStart + 1 - (this.prompts.length > 0 ? 2 : 0);
    return this.endPos - this.startPos;
  }

  setLine(line: number) {
    this.line = line;
    this.prompts.forEach(p => p.setLine(line));
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      highlightColorByLayer(this.layer),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.startPos + 1)
      ), new vscode.Range(
        new vscode.Position(this.line, this.endPos - 1),
        new vscode.Position(this.line, this.endPos)
      ),...this.slicer.map(s => new vscode.Range(
        new vscode.Position(this.line, s),
        new vscode.Position(this.line, s + 2)
      ))]
    ));
    this.prompts.forEach(p => p.gatherDecos(decos));
  }

  static fromString(fr: string): RandomPrompt {
    if (fr.length < 2) {
      throw new Error(`parse RandomPrompt failed:len(prompt) must > 2, got ${fr.length}: ${fr}`);
    }
    if (fr[0] !== '$' || fr[fr.length - 1] !== '$') {
      throw new Error(`parse RandomPrompt failed:prompt must start with '$' and end with '$', got ${fr}`);
    }
    const inst = new RandomPrompt();
    for (const p_ of parseString(fr.substring(1, fr.length - 1), "&&")) {
      inst.prompts.push(Prompt.fromString(p_, false));
    }
    return inst;
  }
}