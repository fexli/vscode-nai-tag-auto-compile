import {PromptBaseInterface, SimplePrompt} from "./simple";
import {DecorationWithRange, highlightColorByLayer, withWaveUnderline} from "../../highlight";
import * as vscode from "vscode";

export class UnparsedPrompt extends SimplePrompt implements PromptBaseInterface {
  constructor(prompt: string) {
    super(prompt);
  }

  static fromString(fr: string): UnparsedPrompt {
    return new UnparsedPrompt(fr);
  }

  setLine(line: number) {
    this.line = line;
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      highlightColorByLayer(this.layer, {}, withWaveUnderline()),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      )]
    ));
  }
}