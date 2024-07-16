import {PromptBaseInterface, PromptRange, SimplePrompt} from "./simple";
import {parseString} from "../parser";
import {Prompt} from "../prompt";
import {DecorationWithRange, getRoundLayer, highlightColorByLayer, PromptDecorationLinter} from "../../highlight";
import * as vscode from "vscode";
import {buildRandomPromptWiki} from "../wikiBuilder";

export class RandomPrompt extends SimplePrompt implements PromptBaseInterface {
  prompts: PromptBaseInterface[];
  slicer: number[];

  constructor() {
    super("");
    this.prompts = [];
    this.slicer = [];
  }

  calculate(startPos: number, layer: number): number {
    this.startPos = startPos + this.beforeEmpty;
    this.layer = layer;
    let nextStart = startPos + this.beforeEmpty + 1;
    for (let i = 0; i < this.prompts.length; i++) {
      const prompt = this.prompts[i];
      let len = prompt.calculate(nextStart, layer + 1);
      nextStart += len + 2; // '&&'
      this.slicer.push(nextStart - 2);
    }
    if (this.slicer.length > 0) {
      this.slicer.pop();
    }
    this.endPos = nextStart + 1 - (this.prompts.length > 0 ? 2 : 0);
    return (this.endPos - this.startPos) + (this.beforeEmpty + this.afterEmpty);
  }

  setLine(line: number) {
    this.line = line;
    this.prompts.forEach(p => p.setLine(line));
  }

  gatherDecos(decos: PromptDecorationLinter) {
    decos.assign(getRoundLayer(this.layer), [new vscode.Range(
      new vscode.Position(this.line, this.startPos),
      new vscode.Position(this.line, this.startPos + 1)
    ), new vscode.Range(
      new vscode.Position(this.line, this.endPos - 1),
      new vscode.Position(this.line, this.endPos)
    ), ...this.slicer.map(s => new vscode.Range(
      new vscode.Position(this.line, s),
      new vscode.Position(this.line, s + 2)
    ))]);
    this.prompts.forEach(p => p.gatherDecos(decos));
  }

  static fromString(fr: string): RandomPrompt {

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
    inst.beforeEmpty = beforeEmpty;
    inst.afterEmpty = afterEmpty;
    return inst;
  }


  getPromptAt(pos: number): PromptRange {
    let filtered = this.prompts.filter(p => p.getStartPos() <= pos && p.getEndPos() >= pos);
    if (filtered.length > 0) {
      return filtered[0].getPromptAt(pos);
    }
    if (this.startPos <= pos && this.endPos >= pos) {
      return {
        matched: true,
        prompt: this.dump(),
        replacedWiki: buildRandomPromptWiki(this),
        range: new vscode.Range(
          new vscode.Position(this.line, this.startPos),
          new vscode.Position(this.line, this.endPos)
        )
      };
    }
    return {
      matched: false,
      prompt: "",
      replacedWiki: '',
      range: undefined
    };
  }

  dump(withEmpty: boolean = false): string {
    if (withEmpty) {
      return " ".repeat(this.beforeEmpty) + '$' + this.prompts.map(p => p.dump(withEmpty)).join('&&') + '$' + " ".repeat(this.beforeEmpty);
    }
    return '$' + this.prompts.map(p => p.dump(withEmpty)).join('&&') + '$';
  }
}