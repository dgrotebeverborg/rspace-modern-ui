package com.axiope.webapp.jsp;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.CharBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.sitemesh.content.tagrules.TagBasedContentProcessor;
import org.sitemesh.content.tagrules.html.CoreHtmlTagRuleBundle;

class WorkspaceDecorationTest {

  @Test
  void workspaceBootstrapSurvivesSiteMeshDecoration() throws Exception {
    String view = Files.readString(Path.of("src/main/webapp/WEB-INF/pages/workspace.jsp"));
    var processor = new TagBasedContentProcessor(new CoreHtmlTagRuleBundle());
    var properties = processor.build(CharBuffer.wrap(view), null).getExtractedProperties();
    String rendered =
        properties.getChild("head").getNonNullValue()
            + properties.getChild("body").getNonNullValue();

    assertThat(rendered)
        .as("Workspace settings must reach the decorated page so its toolbar can initialize")
        .contains(
            "var workspaceSettings =", "var recordId =", "var settingsKey =", "var isSysAdmin =");
  }
}
