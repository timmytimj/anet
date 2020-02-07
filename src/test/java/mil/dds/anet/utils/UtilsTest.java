package mil.dds.anet.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

public class UtilsTest {

  public static class InOut {
    String input;
    String output;

    public InOut(String inputOutput) {
      this.input = inputOutput;
      this.output = inputOutput;
    }

    public InOut(String input, String output) {
      this.input = input;
      this.output = output;
    }

    public String getInput() {
      return input;
    }

    public void setInput(String input) {
      this.input = input;
    }

    public String getOutput() {
      return output;
    }

    public void setOutput(String output) {
      this.output = output;
    }
  }

  private static List<InOut> testCases = new ArrayList<>();

  private static void addTestCase(String inputOutput) {
    testCases.add(new InOut(inputOutput));
  }

  private static void addTestCase(String input, String output) {
    testCases.add(new InOut(input, output));
  }

  public static InOut getCombinedTestCase() {
    final StringBuilder input = new StringBuilder();
    final StringBuilder output = new StringBuilder();
    for (final InOut testCase : testCases) {
      input.append(testCase.getInput());
      output.append(testCase.getOutput());
    }
    return new InOut(input.toString(), output.toString());
  }

  // set up test cases (feel free to add more)
  static {
    // <p> tag is allowed
    addTestCase("<p>test</p>");
    // <h7> tag is not allowed
    addTestCase("<h7>test</h7>", "test");
    // href's are allowed to http, https and mailto, but nofollow is added
    addTestCase("<a href=\"http://www.example.com/\">test</a>",
        "<a href=\"http://www.example.com/\" rel=\"nofollow\">test</a>");
    addTestCase("<a href=\"https://www.example.com/\">test</a>",
        "<a href=\"https://www.example.com/\" rel=\"nofollow\">test</a>");
    addTestCase("<a href=\"mailto:nobody@example.com/\">test</a>",
        "<a href=\"mailto:nobody&#64;example.com/\" rel=\"nofollow\">test</a>");
    // href's to ftp and data are not allowed
    addTestCase("<a href=\"ftp://ftp.example.com/\">test</a>", "test");
    addTestCase("<a href=\"data:MMM\">test</a>", "test");
    // but title is
    addTestCase("<a href=\"data:MMM\" title=\"test\">test</a>", "<a title=\"test\">test</a>");
    // in-line <img> is allowed
    addTestCase("<img src=\"data:image/jpeg;base64;MMM\" />");
    // <img> reference is not allowed
    addTestCase("<img src=\"http://www.wexample.com/logo.gif\" />", "");
    // allowed <img> attributes
    addTestCase(
        "<img title=\"test\" align=\"top\" alt=\"test\" border=\"0\" name=\"test\" height=\"1\" width=\"1\" hspace=\"0\" vspace=\"0\" />");
    // disallowed <img> attributes
    addTestCase("<img crossorigin=\"anonymous\" />", "");
    addTestCase("<img onload=\"test();\" />", "");
    // <script> tag is disallowed
    addTestCase("<script type=\"text/javascript\">alert(\"Hello World!\");</script>", "");
  }

  @Test
  public void testSanitizeHtml() {
    for (final InOut testCase : testCases) {
      assertThat(Utils.sanitizeHtml(testCase.getInput())).isEqualTo(testCase.getOutput());
    }
    final InOut combinedTestCase = getCombinedTestCase();
    assertThat(Utils.sanitizeHtml(combinedTestCase.getInput()))
        .isEqualTo(combinedTestCase.getOutput());
  }

  @Test
  public void testWhitelistedEmailAddresses() {

    final List<String> whitelistedDomains =
        Arrays.asList("ignored_domain.com", "*.ignored", "ignored.*");

    assertFalse(Utils.isEmailWhitelisted("user@test.com", whitelistedDomains), "1");
    assertTrue(Utils.isEmailWhitelisted("user@ignored_domain.com", whitelistedDomains), "2");
    assertTrue(Utils.isEmailWhitelisted("user@ignored.com", whitelistedDomains), "3");
    assertTrue(Utils.isEmailWhitelisted("user@test.ignored", whitelistedDomains), "4");
    assertFalse(Utils.isEmailWhitelisted("user", whitelistedDomains), "5");
  }

  @Test
  public void testIgnoredDomainNames() {

    final List<String> ignoredDomainNames =
        Arrays.asList("ignored_domain", "*.ignored", "ignored.domain");

    assertTrue(Utils.isDomainUserNameIgnored("user@ignored_domain", ignoredDomainNames), "1");
    assertTrue(Utils.isDomainUserNameIgnored("ignored_domain\\user", ignoredDomainNames), "2");
    assertTrue(Utils.isDomainUserNameIgnored("user@test.ignored", ignoredDomainNames), "3");
    assertTrue(Utils.isDomainUserNameIgnored("test.ignored\\user", ignoredDomainNames), "4");
    assertFalse(Utils.isDomainUserNameIgnored("user@test.ignored.not", ignoredDomainNames), "5");
    assertFalse(Utils.isDomainUserNameIgnored("not_ignored_domain\\user", ignoredDomainNames), "6");
    assertFalse(Utils.isDomainUserNameIgnored("ignored_domain", ignoredDomainNames), "7");
    assertTrue(Utils.isDomainUserNameIgnored("user@ignored.domain", ignoredDomainNames), "8");
    assertFalse(Utils.isDomainUserNameIgnored("ignored_domain@user", ignoredDomainNames), "9");
    assertFalse(Utils.isDomainUserNameIgnored("user\\ignored_domain", ignoredDomainNames), "10");
  }

  @Test
  public void testAllDomains() throws Exception {

    final List<String> ignoredDomainNames = Arrays.asList("*");

    assertTrue(Utils.isDomainUserNameIgnored("user@domain", ignoredDomainNames), "1");
    assertTrue(Utils.isEmailWhitelisted("user@domain", ignoredDomainNames), "2");
  }

  @Test
  public void testMalformed() {
    final List<String> ignoredDomainNames = Arrays.asList("ignored_domain");

    assertTrue(Utils.isDomainUserNameIgnored("user@domain@domain", ignoredDomainNames), "1");
    assertFalse(Utils.isEmailWhitelisted("domain\\domain\\user", ignoredDomainNames), "2");
  }

  @Test
  public void testEmpty() {
    final List<String> ignoredDomainNames = Arrays.asList("ignored_domain");

    assertFalse(Utils.isDomainUserNameIgnored("", ignoredDomainNames), "1");
    assertFalse(Utils.isEmailWhitelisted("domain\\user", Arrays.asList()), "2");
  }
}
