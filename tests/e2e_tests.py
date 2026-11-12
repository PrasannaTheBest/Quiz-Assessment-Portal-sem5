import json, time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5173"
IMG = "/home/claude/report/img/"
results = []

def record(tc, desc, expected, ok, actual):
    results.append(dict(id=tc, desc=desc, expected=expected, actual=actual, status="Pass" if ok else "Fail"))
    print(tc, "PASS" if ok else "FAIL", actual)

def answer_all(page, picks):
    n = len(picks)
    for i, p in enumerate(picks):
        page.locator(".option").nth(p).click()
        if i < n - 1:
            page.get_by_role("button", name="Next →").click()

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1100, "height": 760})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    # TC1 home page lists quizzes
    page.goto(BASE); page.wait_for_selector(".card")
    time.sleep(1.2)
    n = page.locator(".card").count()
    page.screenshot(path=IMG + "shot_home.png")
    record("TC1", "Open home page", "Three quiz cards are displayed", n == 3, f"{n} quiz cards displayed")

    # TC2 start quiz -> route
    page.get_by_role("link", name="Start quiz").nth(1).click()
    page.wait_for_selector(".question")
    ok = page.url.endswith("/quiz/react") and "React Fundamentals" in page.inner_text("h1")
    record("TC2", "Click Start quiz on React Fundamentals", "Route /quiz/react opens with first question", ok, f"URL = {page.url.replace(BASE,'')}")

    # TC3 select answer, palette marks answered
    page.locator(".option").nth(1).click()
    sel = "selected" in page.locator(".option").nth(1).get_attribute("class")
    pal = "answered" in page.locator(".palette-btn").nth(0).get_attribute("class")
    record("TC3", "Select an option for Q1", "Option highlighted and palette button turns green", sel and pal, f"selected={sel}, palette answered={pal}")

    # TC4 navigation next / previous / jump
    page.get_by_role("button", name="Next →").click()
    t1 = "Question 2 of 5" in page.inner_text(".quiz-top")
    page.get_by_role("button", name="← Previous").click()
    t2 = "Question 1 of 5" in page.inner_text(".quiz-top")
    page.locator(".palette-btn").nth(3).click()
    t3 = "Question 4 of 5" in page.inner_text(".quiz-top")
    page.locator(".palette-btn").nth(0).click()
    prev_dis = page.get_by_role("button", name="← Previous").is_disabled()
    record("TC4", "Use Next, Previous and palette jump", "Question counter changes correctly; Previous disabled on Q1", t1 and t2 and t3 and prev_dis, f"next={t1}, prev={t2}, jump={t3}, prev disabled on Q1={prev_dis}")

    # TC5 timer counts down
    t_a = page.inner_text(".timer"); time.sleep(3.2); t_b = page.inner_text(".timer")
    def secs(t):
        mm, ss = t.replace("⏱", "").strip().split(":"); return int(mm) * 60 + int(ss)
    record("TC5", "Observe countdown timer for 3 seconds", "Timer decreases each second", secs(t_a) - secs(t_b) >= 3, f"{t_a.strip()} -> {t_b.strip()}")
    page.screenshot(path=IMG + "shot_quiz.png")

    # TC6 unanswered confirm dialog (dismiss) keeps user on quiz
    dialogs = []
    page.once("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
    page.locator(".palette-btn").nth(4).click()
    page.get_by_role("button", name="Submit quiz").click()
    still = "/quiz/react" in page.url
    record("TC6", "Submit with unanswered questions and cancel the confirmation", "Confirmation appears; user stays on quiz", bool(dialogs) and still, f"dialog='{dialogs[0] if dialogs else None}', still on quiz={still}")

    # TC7 all correct -> 5/5 (react answers: 1,1,2,1,1)
    page.goto(BASE + "/quiz/react"); page.wait_for_selector(".question")
    answer_all(page, [1, 1, 2, 1, 1])
    page.get_by_role("button", name="Submit quiz").click()
    page.wait_for_url("**/result"); time.sleep(2.2)
    score_txt = page.inner_text(".score")
    page.screenshot(path=IMG + "shot_result.png", full_page=False)
    record("TC7", "Answer all React questions correctly and submit", "Result page shows 5/5 and confetti", score_txt == "5/5" and page.locator(".confetti").count() == 1, f"Score shown = {score_txt}, confetti present = {page.locator('.confetti').count()==1}")

    # TC8 mixed answers -> 3/5 with review
    page.goto(BASE + "/quiz/react"); page.wait_for_selector(".question")
    answer_all(page, [1, 1, 2, 0, 0])
    page.get_by_role("button", name="Submit quiz").click()
    page.wait_for_url("**/result"); time.sleep(1.6)
    sc = page.inner_text(".score")
    right = page.locator(".review.right").count(); wrong = page.locator(".review.wrong").count()
    page.screenshot(path=IMG + "shot_result_review.png", full_page=True)
    record("TC8", "Answer 3 correct and 2 wrong, then submit", "Score 3/5; review marks 3 right and 2 wrong", sc == "3/5" and right == 3 and wrong == 2, f"Score = {sc}, right cards = {right}, wrong cards = {wrong}")

    # TC9 skipped question handling
    page.goto(BASE + "/quiz/javascript"); page.wait_for_selector(".question")
    page.locator(".option").nth(1).click()
    page.once("dialog", lambda d: d.accept())
    page.locator(".palette-btn").nth(4).click()
    page.get_by_role("button", name="Submit quiz").click()
    page.wait_for_url("**/result"); time.sleep(1)
    skipped = page.locator(".review.skipped").count()
    record("TC9", "Answer only 1 of 5 JavaScript questions and confirm submit", "Result lists 4 skipped questions", skipped == 4, f"Skipped review cards = {skipped}")

    # TC10 best score persisted
    page.goto(BASE); page.wait_for_selector(".card"); time.sleep(1)
    best = page.locator(".best").all_inner_texts()
    record("TC10", "Return to home after taking quizzes", "Best score shown for attempted quizzes (React 5/5)", any("5/5" in x for x in best), f"Best score labels = {best}")

    # TC11 direct /result redirect
    ctx2 = b.new_context(); p2 = ctx2.new_page()
    p2.goto(BASE + "/result"); p2.wait_for_selector("h1")
    record("TC11", "Open /result directly without taking a quiz", "User is redirected to home page", p2.url.rstrip("/") == BASE, f"Final URL = {p2.url}")

    # TC12 unknown quiz id
    p2.goto(BASE + "/quiz/unknown"); p2.wait_for_selector("main")
    txt = p2.inner_text("main")
    record("TC12", "Open /quiz/unknown", "'Quiz not found' message with link home", "Quiz not found" in txt, f"Message = '{txt.strip()[:40]}'")

    # TC13 auto submit at timeout using fake clock
    ctx3 = b.new_context(viewport={"width": 1100, "height": 760}); p3 = ctx3.new_page()
    p3.clock.install()
    p3.goto(BASE + "/quiz/dbms"); p3.wait_for_selector(".question")
    p3.locator(".option").nth(1).click()
    p3.clock.run_for(91_000)
    p3.wait_for_url("**/result", timeout=5000)
    time.sleep(1)
    got = p3.inner_text(".score")
    sk = p3.locator(".review.skipped").count()
    record("TC13", "Let the 90-second DBMS timer expire (simulated clock)", "Quiz auto-submits; unanswered questions marked skipped", "/result" in p3.url and sk == 3, f"Auto-submitted, score = {got}, skipped = {sk}")

    # TC14 low-time warning style
    p4 = ctx3.new_page(); p4.clock.install(); p4.goto(BASE + "/quiz/dbms"); p4.wait_for_selector(".question")
    p4.clock.run_for(80_000)
    danger = "danger" in p4.locator(".timer").get_attribute("class")
    record("TC14", "Run timer down to last 15 seconds", "Timer turns red (danger style)", danger, f"danger class applied = {danger}")

    # TC15 responsive mobile
    ctx5 = b.new_context(viewport={"width": 390, "height": 800}); p5 = ctx5.new_page()
    p5.goto(BASE + "/quiz/javascript"); p5.wait_for_selector(".question")
    overflow = p5.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    time.sleep(1.0)
    p5.screenshot(path=IMG + "shot_mobile.png")
    record("TC15", "Open quiz on a 390 px wide mobile viewport", "No horizontal scrolling; layout adapts", not overflow, f"horizontal overflow = {overflow}")

    record("TC16", "Check browser console during all tests", "No runtime errors", len(errors) == 0, f"{len(errors)} console/page errors")
    b.close()

json.dump(results, open("/home/claude/report/work/test_results.json", "w"), indent=1)
print(sum(r['status']=='Pass' for r in results), "/", len(results))
