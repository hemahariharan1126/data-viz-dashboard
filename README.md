# ♿ Accessibility Auditor

Make the web usable for everyone—this tool checks websites for common accessibility issues and offers human-friendly feedback.

## 🚀 Quick Walkthrough

**Step 1: Paste URL/Load Page** → Enter the website URL you want to audit

**Step 2: Click 'Audit'** → Run the accessibility checks

**Step 3: Review What to Fix** → Get clear, actionable results with suggestions

## ✨ Features

- **Contrast Checks** – Ensures text is readable against backgrounds
- **Alt Text Validation** – Verifies images have descriptive alt text
- **Tab Order Analysis** – Checks keyboard navigation flow
- **Actionable Suggestions** – Human-friendly recommendations, not just errors
- **Browser & CLI Modes** – Use it in your browser or integrate into CI/CD pipelines

## 💡 Why I Built This

Accessibility isn't just a compliance checkbox for me—it's personal. I have friends who navigate the web with screen readers and face daily frustrations with inaccessible sites. I built this tool out of empathy, to make it easier for developers to catch common issues before they become barriers. It's about making the web better for everyone, not just meeting minimum standards.

## 📋 Example Output

Here's what users see in their audit reports:

```markdown
🔴 Critical Issues:
- Missing alt text on 3 images (including hero image)
- Low contrast: Button text (#777) on white background (ratio 3.2:1, needs 4.5:1)

🟡 Warnings:
- Skip navigation link missing
- Form inputs lack associated labels

🟢 Passed Checks:
✓ Heading hierarchy is logical
✓ ARIA landmarks present
✓ No keyboard traps detected

💡 Suggestions:
- Add alt="" to decorative images
- Change button text color to #595959 or darker
- Wrap form inputs with <label> elements
```

## 🤝 Invite Suggestions

**What accessibility issues should it check? PRs and ideas welcome!**

I'd love to hear from you:
- What accessibility barriers do you encounter most?
- What features would make this tool more useful?
- Have ideas for better reporting or integrations?

Open an issue or submit a PR—let's make this tool better together!

---

**Accessibility isn't extra—it's essential.** ♿
