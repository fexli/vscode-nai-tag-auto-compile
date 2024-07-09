import {PromptBaseInterface, PromptRange, SimplePrompt} from "./simple";
import {DecorationWithRange, getColorByLayer, highlightColorByLayer} from "../../highlight";
import vscode from "vscode";
import {buildReplacedPromptWiki} from "../wikiBuilder";


export class ReplacedPrompt extends SimplePrompt implements PromptBaseInterface {
  from_holder: string;
  count: number;

  constructor(from_holder: string, count: number, raw_content: string = "") {
    super(raw_content);
    this.from_holder = from_holder;
    this.count = count;
  }

  calculate(startPos: number, layer: number): number {
    this.startPos = startPos + this.beforeEmpty;
    this.layer = layer;
    this.endPos = this.prompt.length + this.startPos;
    return this.prompt.length + (this.beforeEmpty + this.afterEmpty);
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      vscode.window.createTextEditorDecorationType({
        color: "#00bbf0",
      }),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      )]
    ));
  }

  setLine(line: number) {
    this.line = line;
  }

  static fromString(fr: string): ReplacedPrompt {

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
      throw new Error("parse ReplacedPrompt failed:len(prompt) must > 2, got " + fr.length + ": " + fr);
    }
    if (fr[0] !== '&' || fr[fr.length - 1] !== '&') {
      throw new Error("parse ReplacedPrompt failed:prompt must start with '&' and end with '&', got " + fr);
    }
    // xx.xx.xx,2
    // ^        ^
    // Tag      Count
    const params = fr.substring(1, fr.length - 1).split(',');
    let randCount = 1;
    if (params.length >= 2) {
      randCount = parseInt(params[1]) || 1;
    }
    const data = new ReplacedPrompt(params[0], randCount, fr);
    data.beforeEmpty = beforeEmpty;
    data.afterEmpty = afterEmpty;
    return data;
  }

  getPromptAt(pos: number): PromptRange {
    const matched = this.startPos <= pos && pos <= this.endPos;
    return {
      matched: matched,
      prompt: matched ? this.prompt : '',
      replacedWiki: buildReplacedPromptWiki(this),
      range: matched ? new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      ) : undefined
    };
  }
}