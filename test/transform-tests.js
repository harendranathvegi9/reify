import assert from "assert";
import { relative } from "path";
import { compile, transform } from "../lib/compiler.js";
import { prettyPrint } from "recast";
import { files } from "./all-files.js";

describe("compiler.transform", function () {
  function check(options) {
    Object.keys(files).forEach(function (absPath) {
      if (typeof options.filter === "function" &&
          ! options.filter(relative(__dirname, absPath))) {
        return;
      }

      var code = files[absPath];
      assert.strictEqual(
        prettyPrint(compile(code, options).ast).code,
        prettyPrint(transform(options.parse(code), options)).code,
        "Transform mismatch for " + absPath
      );
    });
  }

  it("gives the same results as compile with babylon", function () {
    check({
      ast: true,
      parse: require("../lib/parsers/babylon.js").parse
    });
  }).timeout(5000);

  it("gives the same results as compile with acorn", function () {
    check({
      ast: true,
      parse: require("../lib/parsers/acorn.js").parse,
      filter: function (relPath) {
        // Acorn can't parse this file, so we skip it.
        return relPath !== "export/from-extensions.js";
      }
    });
  }).timeout(5000);
});
