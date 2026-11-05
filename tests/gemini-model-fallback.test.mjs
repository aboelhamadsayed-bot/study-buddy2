import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const modelFiles = [
  "supabase/functions/qimma-ai-exams/index.ts",
  "supabase/functions/qimma-tutor/index.ts",
  "supabase/functions/_shared/qimma-agent-runtime.ts",
  "study-buddy-main/supabase/functions/qimma-ai-exams/index.ts",
  "study-buddy-main/supabase/functions/qimma-tutor/index.ts",
  "study-buddy-main/supabase/functions/_shared/qimma-agent-runtime.ts",
];

test("all Gemini-backed functions use the supported Flash-Lite fallback", () => {
  for (const path of modelFiles) {
    const source = readFileSync(path, "utf8");
    assert.match(
      source,
      /Deno\.env\.get\(["']GEMINI_MODEL["']\)\s*\|\|\s*["']gemini-3\.5-flash-lite["']/,
      `${path} must use gemini-3.5-flash-lite when GEMINI_MODEL is unset`,
    );
    assert.doesNotMatch(source, /gemini-1\.5-flash/);
  }
});

test("root and nested function copies stay in sync", () => {
  const pairs = [
    ["supabase/functions/qimma-ai-exams/index.ts", "study-buddy-main/supabase/functions/qimma-ai-exams/index.ts"],
    ["supabase/functions/qimma-tutor/index.ts", "study-buddy-main/supabase/functions/qimma-tutor/index.ts"],
    ["supabase/functions/_shared/qimma-agent-runtime.ts", "study-buddy-main/supabase/functions/_shared/qimma-agent-runtime.ts"],
  ];
  for (const [rootPath, nestedPath] of pairs) {
    assert.equal(
      readFileSync(rootPath, "utf8"),
      readFileSync(nestedPath, "utf8"),
      `${rootPath} and ${nestedPath} must remain identical`,
    );
  }
});
