import {PromptBaseInterface, PromptRange, SimplePrompt} from "./simple";
import {checkPs, Prompt} from "../prompt";
import {UnparsedPrompt} from "./unparsed";
import {DecorationWithRange, getRoundLayer, highlightColorByLayer, PromptDecorationLinter} from "../../highlight";
import * as vscode from "vscode";

export class MultiPrompt extends SimplePrompt implements PromptBaseInterface {
  inner: Prompt;
  weightL: string;
  weightR: string;
  beforeEmpty: number;
  afterEmpty: number;

  constructor(
    weightL: string,
    weightR: string,
    inner: Prompt,
  ) {
    super("");
    this.weightL = weightL;
    this.weightR = weightR;
    this.beforeEmpty = this.afterEmpty = 0;
    this.inner = inner;
  }

  setLine(line: number) {
    this.line = line;
    this.inner.setLine(line);
  }

  calculate(startPos: number, layer: number) {
    let nextLayer = this.inner.prompts.length === 1 && this.weightL === "" && this.weightR === "" ? layer : layer + 1;
    this.startPos = startPos + this.beforeEmpty;
    this.layer = layer;
    let endPos = this.inner.calculate(startPos + this.beforeEmpty + this.weightL.length, nextLayer);
    this.endPos = this.startPos + endPos + this.weightL.length + this.weightR.length;
    return endPos + (this.beforeEmpty + this.afterEmpty + this.weightL.length + this.weightR.length);
  }

  gatherDecos(decos: PromptDecorationLinter) {
    let weightCnt = this.weightL.length;
    if (weightCnt > 0) {
      decos.assign(getRoundLayer(this.layer), [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.startPos + weightCnt)
      ), new vscode.Range(
        new vscode.Position(this.line, this.endPos - weightCnt),
        new vscode.Position(this.line, this.endPos)
      )]);
    }
    this.inner.gatherDecos(decos);
  }

  static fromString(fr: string): MultiPrompt | UnparsedPrompt {
    let weightL = "";
    let weightR = "";

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

    let old_param = fr;
    while (true) {
      if (checkPs(old_param, "{", "}")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "{";
        weightR = "}" + weightR;
      } else if (checkPs(old_param, "(", ")")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "(";
        weightR = ")" + weightR;
      } else if (checkPs(old_param, "[", "]")) {
        old_param = old_param.substring(1, old_param.length - 1);
        weightL = weightL + "[";
        weightR = "]" + weightR;
      } else {
        break;
      }
    }
    let loop = old_param === fr;
    const data = new MultiPrompt(weightL, weightR, Prompt.fromString(old_param, false, loop));
    data.beforeEmpty = beforeEmpty;
    data.afterEmpty = afterEmpty;
    return data;
  }

  getPromptAt(pos: number): PromptRange {
    return this.inner.getPromptAt(pos);
  }

  dump(withEmpty: boolean = false): string {
    if (withEmpty) {
      return " ".repeat(this.beforeEmpty) + this.weightL + this.inner.dump(withEmpty) + this.weightR + " ".repeat(this.beforeEmpty);
    }
    return this.weightL + this.inner.dump(withEmpty) + this.weightR;
  }

}