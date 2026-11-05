import { afterEach, describe, expect, test } from "vitest";

import { currentPageKey } from "@/util/pageBranding";

describe("currentPageKey", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    document.getElementById("system-navigation")?.remove();
  });

  test("published documents use the section chosen by the server", () => {
    window.history.replaceState(null, "", "/record/share/published/manage");
    expect(currentPageKey()).toBe("myRSpace");
    const navigation = document.createElement("nav");
    navigation.id = "system-navigation";
    document.body.appendChild(navigation);
    expect(currentPageKey()).toBe("system");
  });

  test.each([
    ["/workspace/trash/list", "myRSpace"],
    ["/workspace/editor/form/list", "myRSpace"],
    ["/workspace/editor/form/", "myRSpace"],
    ["/workspace/editor/structuredDocument/audit/view", "myRSpace"],
    ["/workspace/editor/structuredDocument/123", "workspace"],
    ["/workspace", "workspace"],
    ["/gallery", "gallery"],
  ])("%s -> %s", (path, expected) => {
    window.history.replaceState(null, "", path);
    expect(currentPageKey()).toBe(expected);
  });
});
