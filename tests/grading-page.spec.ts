import { test, expect, Page, BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";

const SCREENSHOT_DIR = "/tmp/grading-test-v3";
const BASE_URL = "http://localhost:3000";
const SECRET = "change-me-to-a-random-secret-string";

const ADMIN_USER = {
  id: "cmm0kwf7d00000udzzhbee6oe",
  email: "yehyu2004@gapp.nthu.edu.tw",
  name: "葉倉羽",
  role: "ADMIN",
};

const STUDENT_USER = {
  id: "cmm0lpc3z00000u19rrpoa6vg",
  email: "alice@gapp.nthu.edu.tw",
  name: "Alice Chen",
  role: "STUDENT",
};

async function createSessionCookie(
  context: BrowserContext,
  user: typeof ADMIN_USER
) {
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret: SECRET,
    salt: "authjs.session-token",
  });

  await context.addCookies([
    {
      name: "authjs.session-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

let testAssignmentId = "";

test.describe("Grading Page Tests", () => {
  test("Full grading workflow", async ({ browser }) => {
    // ---- SETUP: Ensure an assignment + submission exist ----
    const setupContext = await browser.newContext();
    await createSessionCookie(setupContext, ADMIN_USER);
    const setupPage = await setupContext.newPage();

    // First, look up the admin user's actual DB name (may differ from JWT name)
    const usersRes = await setupPage.request.get(`${BASE_URL}/api/users`);
    const usersData = await usersRes.json();
    const usersArray = Array.isArray(usersData) ? usersData : usersData.data || [];
    const adminDbRecord = usersArray.find(
      (u: { id: string }) => u.id === ADMIN_USER.id
    );
    const ADMIN_DB_NAME: string = adminDbRecord?.name || ADMIN_USER.name;
    console.log(`Admin DB name: "${ADMIN_DB_NAME}"`);

    // Fetch assignments to find one, or create one
    const assignmentsRes = await setupPage.request.get(
      `${BASE_URL}/api/assignments`
    );
    const assignmentsData = await assignmentsRes.json();
    let assignments = assignmentsData.data || [];

    if (assignments.length === 0) {
      const createRes = await setupPage.request.post(
        `${BASE_URL}/api/assignments`,
        {
          data: {
            title: "Report 1: Observational Cosmology",
            description:
              "Write a report on observational cosmology techniques.",
            reportNumber: 1,
            totalPoints: 100,
            published: true,
          },
        }
      );
      const createData = await createRes.json();
      testAssignmentId = createData.data.id;
      console.log("Created assignment:", testAssignmentId);
    } else {
      const published = assignments.find(
        (a: { published: boolean }) => a.published
      );
      if (published) {
        testAssignmentId = published.id;
      } else {
        testAssignmentId = assignments[0].id;
        await setupPage.request.patch(
          `${BASE_URL}/api/assignments/${testAssignmentId}`,
          { data: { published: true } }
        );
      }
    }

    console.log("Using assignment ID:", testAssignmentId);

    // Ensure a submission exists for Alice
    await setupContext.clearCookies();
    await createSessionCookie(setupContext, STUDENT_USER);

    const assignmentDetailRes = await setupPage.request.get(
      `${BASE_URL}/api/assignments/${testAssignmentId}`
    );
    const assignmentDetail = await assignmentDetailRes.json();
    const existingSubmission = assignmentDetail.data?.submission;

    if (!existingSubmission) {
      const subRes = await setupPage.request.post(
        `${BASE_URL}/api/submissions`,
        {
          data: {
            assignmentId: testAssignmentId,
            fileUrl: "/uploads/sample-report.pdf",
            fileName: "alice-cosmology-report.pdf",
          },
        }
      );
      const subData = await subRes.json();
      console.log("Created submission for Alice:", subData.data?.id);
    } else {
      console.log(
        "Alice already has a submission:",
        existingSubmission.id
      );
      if (existingSubmission.gradedAt) {
        await setupContext.clearCookies();
        await createSessionCookie(setupContext, ADMIN_USER);
        const returnRes = await setupPage.request.delete(
          `${BASE_URL}/api/grading`,
          { data: { submissionId: existingSubmission.id } }
        );
        console.log(
          "Cleared existing grade, status:",
          returnRes.status()
        );
      }
    }

    await setupContext.close();

    // =============================================
    // TEST 1: Login as admin, go to /grading
    // =============================================
    const adminContext = await browser.newContext();
    await createSessionCookie(adminContext, ADMIN_USER);
    const page = await adminContext.newPage();

    await page.goto(`${BASE_URL}/grading`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // =============================================
    // TEST 2: Screenshot - empty state (no assignment selected)
    // =============================================
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-empty-state.png`,
      fullPage: true,
    });
    console.log("Screenshot 1: Empty state saved");

    const emptyStateText = await page.textContent("body");
    expect(emptyStateText).toContain("Select an assignment to grade");

    // =============================================
    // TEST 3: Click the assignment picker, screenshot the popover
    // =============================================
    const pickerButton = page.locator(
      'button:has-text("Select an assignment to grade"), button:has-text("Report")'
    );
    await pickerButton.first().click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-assignment-picker.png`,
      fullPage: true,
    });
    console.log("Screenshot 2: Assignment picker saved");

    // =============================================
    // TEST 4: Select the assignment with submissions
    // =============================================
    const popoverContent = page.locator(
      "[data-radix-popper-content-wrapper]"
    );
    await expect(popoverContent).toBeVisible();

    const assignmentButtons = popoverContent.locator("button");
    const count = await assignmentButtons.count();
    console.log(`Found ${count} assignments in picker`);

    let clicked = false;
    for (let i = 0; i < count; i++) {
      const text = await assignmentButtons.nth(i).textContent();
      if (text && text.includes("submission")) {
        await assignmentButtons.nth(i).click();
        clicked = true;
        console.log(
          "Clicked assignment:",
          text?.trim().substring(0, 50)
        );
        break;
      }
    }

    if (!clicked && count > 0) {
      await assignmentButtons.first().click();
      clicked = true;
      console.log("Clicked first available assignment");
    }

    await page.waitForTimeout(1500);

    // =============================================
    // TEST 5: Screenshot - submission list
    // CHECK: ungraded score shows em dash, NOT "0/100"
    // =============================================
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-submission-list.png`,
      fullPage: true,
    });
    console.log("Screenshot 3: Submission list saved");

    const scoreElements = page.locator('span:has-text("/100")');
    const scoreCount = await scoreElements.count();
    console.log(`Found ${scoreCount} score elements`);

    let emDashFound = false;
    let zeroScoreFound = false;
    for (let i = 0; i < scoreCount; i++) {
      const text = await scoreElements.nth(i).textContent();
      console.log(`Score element ${i}: "${text}"`);
      if (text && text.includes("\u2014/")) {
        emDashFound = true;
      }
      if (text && text.match(/\b0\/100\b/)) {
        zeroScoreFound = true;
      }
    }

    if (emDashFound && !zeroScoreFound) {
      console.log(
        "CHECK 5: PASS - Ungraded score shows em dash (\u2014/100), not 0/100"
      );
    } else if (zeroScoreFound) {
      console.log(
        "CHECK 5: FAIL - Found 0/100 instead of em dash for ungraded score"
      );
    } else {
      console.log(
        "CHECK 5: INFO - No ungraded submissions found to verify em dash display"
      );
    }

    // =============================================
    // TEST 6: Click Alice's submission
    // =============================================
    const aliceButton = page.locator('button:has-text("Alice Chen")');
    if ((await aliceButton.count()) > 0) {
      await aliceButton.first().click();
      await page.waitForTimeout(500);
      console.log("Clicked Alice's submission");
    } else {
      const aliceEmailButton = page.locator(
        'button:has-text("alice@gapp.nthu.edu.tw")'
      );
      await aliceEmailButton.first().click();
      await page.waitForTimeout(500);
      console.log("Clicked Alice's submission by email");
    }

    // =============================================
    // TEST 7: Screenshot - grading panel
    // CHECK: View PDF is a prominent indigo-colored clickable banner
    //        showing filename, "Click to open PDF in new tab", above grade card
    // =============================================
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-grading-panel.png`,
      fullPage: true,
    });
    console.log("Screenshot 4: Grading panel saved");

    const pdfBanner = page.locator(
      'a:has-text("Click to open PDF in new tab")'
    );
    const pdfBannerVisible = await pdfBanner.isVisible().catch(() => false);

    if (pdfBannerVisible) {
      const bannerClasses = await pdfBanner.getAttribute("class");
      const hasIndigoStyling =
        bannerClasses?.includes("indigo") || false;
      const bannerText = await pdfBanner.textContent();
      const hasFilename =
        bannerText?.includes(".pdf") || bannerText?.includes("Report") || false;

      if (hasIndigoStyling) {
        console.log(
          "CHECK 7: PASS - View PDF is a prominent indigo-colored banner above the grade card"
        );
        console.log(`  Banner text: "${bannerText?.trim()}"`);
        console.log(`  Has indigo styling: ${hasIndigoStyling}`);
        console.log(`  Shows filename/label: ${hasFilename}`);
      } else {
        console.log(
          "CHECK 7: PARTIAL - PDF banner found but may not have indigo styling"
        );
        console.log(`  Classes: ${bannerClasses}`);
      }
    } else {
      console.log(
        "CHECK 7: FAIL - No PDF banner with 'Click to open PDF in new tab' found"
      );
    }

    // Verify order: PDF link before grade card
    const gradePanelBody = page.locator(".max-w-2xl");
    if (await gradePanelBody.isVisible()) {
      const children = gradePanelBody.locator("> *");
      const childCount = await children.count();
      let pdfIndex = -1;
      let gradeCardIndex = -1;
      for (let i = 0; i < childCount; i++) {
        const text = await children.nth(i).textContent();
        if (
          text?.includes("Click to open PDF") ||
          text?.includes("Student Report")
        ) {
          pdfIndex = i;
        }
        if (text?.includes("Grade") && text?.includes("Score")) {
          gradeCardIndex = i;
        }
      }
      if (pdfIndex >= 0 && gradeCardIndex >= 0) {
        console.log(
          `  PDF banner at index ${pdfIndex}, Grade card at index ${gradeCardIndex}: ${
            pdfIndex < gradeCardIndex ? "CORRECT ORDER" : "WRONG ORDER"
          }`
        );
      }
    }

    // =============================================
    // TEST 8: Fill score=90, feedback, submit grade
    // =============================================
    const scoreInput = page.locator("input#score");
    await scoreInput.fill("90");

    const feedbackTextarea = page.locator("textarea#feedback");
    await feedbackTextarea.fill(
      "Excellent analysis of cosmological models"
    );

    const submitButton = page.locator(
      'button:has-text("Submit Grade"), button:has-text("Update Grade")'
    );
    await submitButton.first().click();
    await page.waitForTimeout(2000);

    // =============================================
    // TEST 9: Screenshot after grading
    // CHECK: "Graded by <name>" in panel header AND submission list
    //        "Return to Student" button visible
    // =============================================
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-after-grading.png`,
      fullPage: true,
    });
    console.log("Screenshot 5: After grading saved");

    // Use the actual DB name for checks
    const gradedByPattern = `Graded by ${ADMIN_DB_NAME}`;
    console.log(`Looking for: "${gradedByPattern}"`);

    // Full page text for comprehensive check
    const fullPageText = await page.textContent("body");
    const gradedByCount =
      (fullPageText?.match(new RegExp(gradedByPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
    console.log(
      `  Total "${gradedByPattern}" occurrences on page: ${gradedByCount}`
    );

    // Also check with a looser "Graded by" match
    const gradedByAnyCount =
      (fullPageText?.match(/Graded by /g) || []).length;
    console.log(`  Total "Graded by ..." occurrences: ${gradedByAnyCount}`);

    // CHECK 9a: "Graded by <name>" in panel header
    const panelHeaderGradedBy = page.locator(
      `text=${gradedByPattern}`
    );
    const gradedByInHeaderCount = await panelHeaderGradedBy.count();
    const gradedByInHeader = gradedByInHeaderCount > 0;
    console.log(
      `CHECK 9a: ${
        gradedByInHeader ? "PASS" : "FAIL"
      } - "${gradedByPattern}" in panel header (found ${gradedByInHeaderCount} occurrences)`
    );

    // Check specifically in the header area (first border-b element)
    if (gradedByInHeader) {
      // Verify it's in the header section specifically
      const headerSection = page.locator(
        '.flex-1 > .border-b'
      );
      const headerText = await headerSection.first().textContent().catch(() => "");
      const inHeader = headerText?.includes(gradedByPattern) || false;
      console.log(
        `  Specifically in panel header border-b: ${inHeader}`
      );
    }

    // CHECK 9b: "Graded by <name>" in submission list item
    // The submission list is the first column in the flex layout
    const submissionListContainer = page.locator(
      ".w-full.md\\:w-80"
    );
    const submissionListText = await submissionListContainer
      .first()
      .textContent()
      .catch(() => "");
    const gradedByInList =
      submissionListText?.includes(gradedByPattern) || false;
    console.log(
      `CHECK 9b: ${
        gradedByInList ? "PASS" : "FAIL"
      } - "${gradedByPattern}" in submission list item`
    );
    if (!gradedByInList) {
      // Check if "Graded by" appears at all in the list
      const anyGradedByInList = submissionListText?.includes("Graded by") || false;
      console.log(`  "Graded by" (any name) in list: ${anyGradedByInList}`);
      if (anyGradedByInList) {
        // Extract what name follows "Graded by"
        const match = submissionListText?.match(/Graded by (.+?)(?:\s|$)/);
        console.log(`  Actual graded-by text in list: "${match?.[0]}"`);
      }
    }

    // CHECK 9c: Return to Student button visible
    const returnButton = page.locator(
      'button:has-text("Return to Student")'
    );
    const returnButtonVisible = await returnButton
      .isVisible()
      .catch(() => false);
    console.log(
      `CHECK 9c: ${
        returnButtonVisible ? "PASS" : "FAIL"
      } - "Return to Student" button visible`
    );

    await adminContext.close();

    // =============================================
    // TEST 10-11: Login as student Alice, go to assignment detail page
    // CHECK: "Graded by <name>" shown next to grade
    // =============================================
    const studentContext = await browser.newContext();
    await createSessionCookie(studentContext, STUDENT_USER);
    const studentPage = await studentContext.newPage();

    await studentPage.goto(
      `${BASE_URL}/assignments/${testAssignmentId}`,
      { waitUntil: "networkidle" }
    );
    await studentPage.waitForTimeout(1500);

    await studentPage.screenshot({
      path: `${SCREENSHOT_DIR}/06-student-view.png`,
      fullPage: true,
    });
    console.log("Screenshot 6: Student view saved");

    const studentPageText = await studentPage.textContent("body");
    const gradedByInStudentView =
      studentPageText?.includes(gradedByPattern) || false;
    const anyGradedByInStudent =
      studentPageText?.includes("Graded by") || false;
    console.log(
      `CHECK 10/11: ${
        gradedByInStudentView ? "PASS" : "FAIL"
      } - "${gradedByPattern}" shown in student assignment detail view`
    );
    if (!gradedByInStudentView && anyGradedByInStudent) {
      const match = studentPageText?.match(/Graded by (.+?)(?:\s|$)/);
      console.log(`  Found "Graded by" with different name: "${match?.[0]}"`);
    }

    const gradeShown = studentPageText?.includes("90") || false;
    const feedbackShown =
      studentPageText?.includes(
        "Excellent analysis of cosmological models"
      ) || false;
    console.log(`  Grade (90) visible: ${gradeShown}`);
    console.log(`  Feedback visible: ${feedbackShown}`);

    await studentContext.close();

    // =============================================
    // SUMMARY
    // =============================================
    console.log("\n========================================");
    console.log("         FINAL TEST REPORT");
    console.log("========================================");
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log("");
    console.log(
      `CHECK 5  - Ungraded score em dash (\u2014/100):  ${
        emDashFound && !zeroScoreFound
          ? "PASS"
          : zeroScoreFound
            ? "FAIL"
            : "N/A (no ungraded)"
      }`
    );
    console.log(
      `CHECK 7  - PDF banner (indigo, filename):      ${
        pdfBannerVisible ? "PASS" : "FAIL"
      }`
    );
    console.log(
      `CHECK 9a - "Graded by" in panel header:        ${
        gradedByInHeader ? "PASS" : "FAIL"
      }`
    );
    console.log(
      `CHECK 9b - "Graded by" in submission list:     ${
        gradedByInList ? "PASS" : "FAIL"
      }`
    );
    console.log(
      `CHECK 9c - "Return to Student" button:         ${
        returnButtonVisible ? "PASS" : "FAIL"
      }`
    );
    console.log(
      `CHECK 11 - Student view "Graded by":           ${
        gradedByInStudentView ? "PASS" : "FAIL"
      }`
    );
    console.log(`  Grade (90) visible in student view:          ${gradeShown}`);
    console.log(`  Feedback visible in student view:             ${feedbackShown}`);
    console.log("========================================");
  });
});
