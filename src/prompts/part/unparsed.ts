import {PromptBaseInterface, SimplePrompt} from "./simple";
import {Prompt} from "../prompt";
import {DecorationWithRange, highlightColorByLayer} from "../../highlight";
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
      highlightColorByLayer(this.layer, {
        backgroundColor: "rgb(187,18,18)"
      }),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      )]
    ));
  }
}