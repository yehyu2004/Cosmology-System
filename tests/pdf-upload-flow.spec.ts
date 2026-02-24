import { test, expect, BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

const SCREENSHOT_DIR = "/tmp/pdf-upload-test";
const BASE_URL = "http://localhost:3000";
const SECRET = "change-me-to-a-random-secret-string";

const ADMIN_USER = {
  id: "cmm0kwf7d00000udzzhbee6oe",
  email: "yehyu2004@gapp.nthu.edu.tw",
  name: "Admin TA",
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

async function createTestPdf(): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]); // US Letter
  const { height } = page.getSize();

  // Title
  page.drawText("Observational Cosmology Report", {
    x: 100,
    y: height - 80,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0.6),
  });

  // Subtitle
  page.drawText("Analysis of Hubble's Law", {
    x: 150,
    y: height - 110,
    size: 16,
    font: timesRomanFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Author
  page.drawText("Alice Chen - NTHU Physics Department", {
    x: 150,
    y: height - 140,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Body text
  const bodyLines = [
    "Abstract:",
    "",
    "This report examines the relationship between galaxy recession velocity",
    "and distance as described by Hubble's Law (v = H0 * d). Using data from",
    "the Sloan Digital Sky Survey (SDSS), we analyze the redshift-distance",
    "relationship for Type Ia supernovae at cosmological distances.",
    "",
    "1. Introduction",
    "",
    "Edwin Hubble's 1929 observation that galaxies recede from us at velocities",
    "proportional to their distance revolutionized our understanding of the",
    "universe. The Hubble constant H0 has been refined over decades of",
    "observations, with current estimates placing it around 67-73 km/s/Mpc.",
    "",
    "2. Methodology",
    "",
    "We collected spectroscopic data from 150 Type Ia supernovae and computed",
    "their luminosity distances using the standard candle technique. Redshift",
    "measurements were obtained from the emission/absorption line analysis.",
  ];

  let y = height - 190;
  for (const line of bodyLines) {
    page.drawText(line, {
      x: 72,
      y,
      size: 11,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(SCREENSHOT_DIR, "test-cosmology-report.pdf");
  fs.writeFileSync(pdfPath, pdfBytes);
  return pdfPath;
}

test.describe("PDF Upload and Viewing Flow", () => {
  let testAssignmentId = "";
  let pdfFilePath = "";

  test.beforeAll(async () => {
    // Ensure screenshot dir exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    // Create the test PDF
    pdfFilePath = await createTestPdf();
    console.log("Created test PDF at:", pdfFilePath);
  });

  test("Full PDF upload and viewing end-to-end", async ({ browser }) => {
    // ===========================================================
    // SETUP: Find or create an assignment where Alice has no graded submission
    // ===========================================================
    const setupContext = await browser.newContext();
    await createSessionCookie(setupContext, ADMIN_USER);
    const setupPage = await setupContext.newPage();

    // Fetch existing assignments
    const assignmentsRes = await setupPage.request.get(
      `${BASE_URL}/api/assignments`
    );
    const assignmentsData = await assignmentsRes.json();
    const assignments = assignmentsData.data || [];
    console.log(`Found ${assignments.length} existing assignments`);

    // Try to find one where Alice does NOT have a graded submission
    let assignmentToUse: string | null = null;

    for (const assignment of assignments) {
      if (!assignment.published) continue;

      // Switch to Alice to check her submission status
      await setupContext.clearCookies();
      await createSessionCookie(setupContext, STUDENT_USER);

      const detailRes = await setupPage.request.get(
        `${BASE_URL}/api/assignments/${assignment.id}`
      );
      const detailData = await detailRes.json();
      const submission = detailData.data?.submission;

      if (!submission) {
        // No submission at all - perfect for upload test
        assignmentToUse = assignment.id;
        console.log(
          `Found assignment "${assignment.title}" (${assignment.id}) - Alice has no submission`
        );
        break;
      } else if (!submission.gradedAt) {
        // Ungraded submission exists - we can delete and re-upload
        assignmentToUse = assignment.id;
        console.log(
          `Found assignment "${assignment.title}" (${assignment.id}) - Alice has ungraded submission`
        );
        break;
      } else {
        // Graded submission - we need admin to return it first
        console.log(
          `Assignment "${assignment.title}" - Alice has graded submission, will try to return it`
        );
        await setupContext.clearCookies();
        await createSessionCookie(setupContext, ADMIN_USER);
        const returnRes = await setupPage.request.delete(
          `${BASE_URL}/api/grading`,
          { data: { submissionId: submission.id } }
        );
        if (returnRes.ok()) {
          assignmentToUse = assignment.id;
          console.log("Returned graded submission to Alice");
          break;
        }
      }
    }

    // If no suitable assignment found, create a new one
    if (!assignmentToUse) {
      await setupContext.clearCookies();
      await createSessionCookie(setupContext, ADMIN_USER);

      const createRes = await setupPage.request.post(
        `${BASE_URL}/api/assignments`,
        {
          data: {
            title: "PDF Upload Test - Hubble Law Analysis",
            description:
              "Submit a report analyzing Hubble's Law using Type Ia supernovae data.",
            reportNumber: 3,
            totalPoints: 100,
            published: true,
          },
        }
      );
      const createData = await createRes.json();
      expect(createRes.ok()).toBeTruthy();
      assignmentToUse = createData.data.id;
      console.log("Created new assignment:", assignmentToUse);
    }

    testAssignmentId = assignmentToUse!;
    console.log("Using assignment ID:", testAssignmentId);

    // Ensure Alice has no existing submission for a clean upload test
    await setupContext.clearCookies();
    await createSessionCookie(setupContext, STUDENT_USER);

    const checkRes = await setupPage.request.get(
      `${BASE_URL}/api/assignments/${testAssignmentId}`
    );
    const checkData = await checkRes.json();
    const existingSub = checkData.data?.submission;

    if (existingSub && !existingSub.gradedAt) {
      // There is an existing ungraded submission - this is fine,
      // the upload will re-upload (upsert)
      console.log(
        "Existing ungraded submission found - upload will update it"
      );
    }

    await setupContext.close();

    // ===========================================================
    // STEP 1-2: Log in as student Alice
    // ===========================================================
    const studentContext = await browser.newContext();
    await createSessionCookie(studentContext, STUDENT_USER);
    const studentPage = await studentContext.newPage();

    // ===========================================================
    // STEP 3: Go to assignment detail page
    // ===========================================================
    await studentPage.goto(
      `${BASE_URL}/assignments/${testAssignmentId}`,
      { waitUntil: "networkidle" }
    );
    await studentPage.waitForTimeout(1500);

    // Verify we see the assignment page
    const pageContent = await studentPage.textContent("body");
    expect(pageContent).toContain("Your Submission");

    await studentPage.screenshot({
      path: `${SCREENSHOT_DIR}/01-student-assignment-before-upload.png`,
      fullPage: true,
    });
    console.log("Screenshot 01: Student assignment page before upload");

    // ===========================================================
    // STEP 4: Check for existing graded submission
    // ===========================================================
    const hasGraded = pageContent?.includes(
      "Assignment graded. Contact your TA"
    );
    if (hasGraded) {
      console.log(
        "WARNING: Found graded submission. This should have been cleared in setup."
      );
    }

    // ===========================================================
    // STEP 5: Upload the real PDF file
    // ===========================================================
    // Find the file input
    const fileInput = studentPage.locator('input[type="file"][accept=".pdf"]');
    await expect(fileInput).toBeAttached();

    // Upload the PDF
    await fileInput.setInputFiles(pdfFilePath);
    console.log("Set PDF file on input");

    // Wait for upload to complete
    await studentPage.waitForTimeout(3000);

    // ===========================================================
    // STEP 6: Screenshot after upload - verify submission shows PDF filename
    // ===========================================================
    await studentPage.screenshot({
      path: `${SCREENSHOT_DIR}/02-student-after-upload.png`,
      fullPage: true,
    });
    console.log("Screenshot 02: After upload");

    // Verify the submission appears with the filename
    const afterUploadContent = await studentPage.textContent("body");
    const uploadSuccess =
      afterUploadContent?.includes("Submitted:") ||
      afterUploadContent?.includes("test-cosmology-report.pdf");

    console.log(
      `Upload success verification: ${uploadSuccess ? "PASS" : "FAIL"}`
    );

    if (uploadSuccess) {
      // Check filename is displayed
      const filenameShown = afterUploadContent?.includes(
        "test-cosmology-report.pdf"
      );
      console.log(`  Filename shown: ${filenameShown ? "YES" : "NO"}`);

      // Check for "Submitted:" text
      const submittedShown = afterUploadContent?.includes("Submitted:");
      console.log(`  "Submitted:" text shown: ${submittedShown ? "YES" : "NO"}`);
    }

    // Check for View button
    const viewButton = studentPage.locator(
      'a:has(button:has-text("View")), button:has-text("View")'
    );
    const viewButtonVisible = await viewButton.first().isVisible().catch(() => false);
    console.log(`  View button visible: ${viewButtonVisible ? "YES" : "NO"}`);

    // ===========================================================
    // STEP 7: Click the "View" button to check PDF link works
    // ===========================================================
    if (viewButtonVisible) {
      // Get the href of the view link
      const viewLink = studentPage.locator('a:has(button:has-text("View"))');
      const href = await viewLink.getAttribute("href");
      console.log(`  PDF link href: ${href}`);

      if (href) {
        // Navigate to the PDF URL and check response
        const pdfResponse = await studentPage.request.get(
          `${BASE_URL}${href}`
        );
        const pdfStatus = pdfResponse.status();
        console.log(`  PDF URL response status: ${pdfStatus}`);
        console.log(
          `  PDF accessible: ${pdfStatus === 200 ? "YES" : "NO"}`
        );

        // Check content type
        const contentType = pdfResponse.headers()["content-type"];
        console.log(`  Content-Type: ${contentType}`);

        // Verify PDF content by checking response body size
        const pdfBody = await pdfResponse.body();
        console.log(`  PDF file size: ${pdfBody.length} bytes`);
        console.log(
          `  PDF starts with %PDF: ${
            pdfBody.toString("utf8", 0, 5).startsWith("%PDF") ? "YES" : "NO"
          }`
        );

        // Screenshot the student page showing the View button instead
        // (navigating to a PDF URL triggers a download in Playwright)
        await studentPage.screenshot({
          path: `${SCREENSHOT_DIR}/03-student-pdf-link-verified.png`,
          fullPage: true,
        });
        console.log("Screenshot 03: Student page with verified PDF link");
      }
    }

    await studentContext.close();

    // ===========================================================
    // STEP 8: Log in as admin/TA
    // ===========================================================
    const adminContext = await browser.newContext();
    await createSessionCookie(adminContext, ADMIN_USER);
    const adminPage = await adminContext.newPage();

    // ===========================================================
    // STEP 9: Go to /grading, select the assignment, select Alice's submission
    // ===========================================================
    await adminPage.goto(`${BASE_URL}/grading`, {
      waitUntil: "networkidle",
    });
    await adminPage.waitForTimeout(1000);

    // Click assignment picker
    const pickerButton = adminPage.locator(
      'button:has-text("Select an assignment to grade"), button:has-text("Report"), button:has-text("PDF Upload Test"), button:has-text("Observational")'
    );
    await pickerButton.first().click();
    await adminPage.waitForTimeout(500);

    // Wait for popover
    const popoverContent = adminPage.locator(
      "[data-radix-popper-content-wrapper]"
    );
    await expect(popoverContent).toBeVisible({ timeout: 5000 });

    // Find and click the assignment we used for the test
    const assignmentButtons = popoverContent.locator("button");
    const buttonCount = await assignmentButtons.count();
    console.log(`Assignment picker has ${buttonCount} items`);

    let assignmentClicked = false;
    for (let i = 0; i < buttonCount; i++) {
      const text = await assignmentButtons.nth(i).textContent();
      // Try to match by known assignment title or the one with submissions
      if (text && (text.includes("submission") || text.includes("PDF Upload Test") || text.includes("Hubble"))) {
        await assignmentButtons.nth(i).click();
        assignmentClicked = true;
        console.log(`Clicked assignment: "${text.trim().substring(0, 60)}"`);
        break;
      }
    }

    // Fallback: click the first one with submissions
    if (!assignmentClicked) {
      for (let i = 0; i < buttonCount; i++) {
        const text = await assignmentButtons.nth(i).textContent();
        if (text && text.includes("submission")) {
          await assignmentButtons.nth(i).click();
          assignmentClicked = true;
          console.log(`Clicked assignment (fallback): "${text.trim().substring(0, 60)}"`);
          break;
        }
      }
    }

    // Last fallback: click first
    if (!assignmentClicked && buttonCount > 0) {
      await assignmentButtons.first().click();
      console.log("Clicked first assignment as last fallback");
    }

    await adminPage.waitForTimeout(2000);

    // Click Alice's submission
    const aliceButton = adminPage.locator('button:has-text("Alice Chen")');
    if ((await aliceButton.count()) > 0) {
      await aliceButton.first().click();
      console.log("Clicked Alice's submission");
    } else {
      const aliceEmail = adminPage.locator(
        'button:has-text("alice@gapp.nthu.edu.tw")'
      );
      if ((await aliceEmail.count()) > 0) {
        await aliceEmail.first().click();
        console.log("Clicked Alice's submission by email");
      } else {
        console.log("WARNING: Could not find Alice's submission in the list");
      }
    }

    await adminPage.waitForTimeout(1000);

    // ===========================================================
    // STEP 10: Screenshot the grading panel - verify PDF banner
    // ===========================================================
    await adminPage.screenshot({
      path: `${SCREENSHOT_DIR}/04-admin-grading-panel.png`,
      fullPage: true,
    });
    console.log("Screenshot 04: Admin grading panel with Alice's submission");

    // Check the PDF banner
    const pdfBanner = adminPage.locator(
      'a:has-text("Click to open PDF in new tab")'
    );
    const pdfBannerVisible = await pdfBanner.isVisible().catch(() => false);

    console.log(`\n--- PDF BANNER CHECK ---`);
    console.log(`PDF banner visible: ${pdfBannerVisible ? "YES" : "NO"}`);

    if (pdfBannerVisible) {
      const bannerText = await pdfBanner.textContent();
      const bannerClasses = await pdfBanner.getAttribute("class");

      console.log(`Banner text: "${bannerText?.trim()}"`);

      // Check if filename is shown
      const showsFilename =
        bannerText?.includes("test-cosmology-report.pdf") ||
        bannerText?.includes(".pdf");
      console.log(`Shows PDF filename: ${showsFilename ? "YES" : "NO"}`);

      // Check indigo styling
      const hasIndigoStyling = bannerClasses?.includes("indigo") || false;
      console.log(`Has indigo styling: ${hasIndigoStyling ? "YES" : "NO"}`);

      // Check it's prominent (has padding, border, bg)
      const hasProminentStyling =
        bannerClasses?.includes("p-4") &&
        bannerClasses?.includes("rounded") &&
        bannerClasses?.includes("border");
      console.log(
        `Has prominent styling (padding, rounded, border): ${
          hasProminentStyling ? "YES" : "NO"
        }`
      );

      // Get the PDF URL from the banner
      const pdfHref = await pdfBanner.getAttribute("href");
      console.log(`PDF banner href: ${pdfHref}`);

      // ===========================================================
      // STEP 11: Click the PDF banner link - verify accessible
      // ===========================================================
      if (pdfHref) {
        const fullPdfUrl = pdfHref.startsWith("http")
          ? pdfHref
          : `${BASE_URL}${pdfHref}`;

        const pdfResponse = await adminPage.request.get(fullPdfUrl);
        const pdfStatus = pdfResponse.status();
        const contentType = pdfResponse.headers()["content-type"];

        console.log(`\n--- PDF ACCESSIBILITY CHECK (Admin) ---`);
        console.log(`PDF URL: ${fullPdfUrl}`);
        console.log(`Response status: ${pdfStatus}`);
        console.log(`Content-Type: ${contentType}`);
        console.log(
          `PDF accessible from admin: ${pdfStatus === 200 ? "YES" : "NO"}`
        );

        // ===========================================================
        // STEP 12: Verify PDF content from admin side
        // ===========================================================
        const pdfBody = await pdfResponse.body();
        console.log(`PDF file size from admin: ${pdfBody.length} bytes`);
        console.log(
          `PDF starts with %PDF: ${
            pdfBody.toString("utf8", 0, 5).startsWith("%PDF") ? "YES" : "NO"
          }`
        );

        // Take screenshot of the grading panel showing the PDF banner
        await adminPage.screenshot({
          path: `${SCREENSHOT_DIR}/05-admin-pdf-banner-verified.png`,
          fullPage: true,
        });
        console.log("Screenshot 05: Admin grading panel with verified PDF link");
      }
    } else {
      console.log("WARNING: PDF banner not found in grading panel");

      // Try to find any PDF-related links
      const anyPdfLink = adminPage.locator('a[href*=".pdf"], a[href*="uploads"]');
      const anyPdfCount = await anyPdfLink.count();
      console.log(`  Any PDF-related links found: ${anyPdfCount}`);

      if (anyPdfCount > 0) {
        for (let i = 0; i < anyPdfCount; i++) {
          const href = await anyPdfLink.nth(i).getAttribute("href");
          const text = await anyPdfLink.nth(i).textContent();
          console.log(`  Link ${i}: href="${href}" text="${text?.trim()}"`);
        }
      }

      // Also check if the submission panel is showing at all
      const panelText = await adminPage.textContent("body");
      console.log(
        `  "Student Report" text found: ${
          panelText?.includes("Student Report") ? "YES" : "NO"
        }`
      );
      console.log(
        `  "Alice Chen" text found: ${
          panelText?.includes("Alice Chen") ? "YES" : "NO"
        }`
      );
    }

    // Final full-page screenshot of grading page
    await adminPage.screenshot({
      path: `${SCREENSHOT_DIR}/06-admin-grading-final.png`,
      fullPage: true,
    });
    console.log("Screenshot 06: Final admin grading view");

    await adminContext.close();

    // ===========================================================
    // SUMMARY REPORT
    // ===========================================================
    console.log("\n========================================");
    console.log("   PDF UPLOAD & VIEWING FLOW REPORT");
    console.log("========================================");
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log("");
    console.log(
      `1. Upload works end-to-end: ${uploadSuccess ? "YES" : "NO"}`
    );
    console.log(
      `2. Student can see uploaded PDF: ${viewButtonVisible ? "YES" : "NO"}`
    );
    console.log(
      `3. PDF banner visible in grading page: ${pdfBannerVisible ? "YES" : "NO"}`
    );
    console.log("========================================");
  });
});
