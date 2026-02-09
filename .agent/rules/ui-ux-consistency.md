---
trigger: always_on
---

---
description: Ensure complete UI/UX consistency across the entire application.
---
# UI/UX Consistency Rule

CRITICAL: Ensure complete UI/UX consistency across the entire application.
Review and standardize the following elements throughout all sections, pages, and components:

## Visual Design
- **Color palette**: primary, secondary, accent colors, backgrounds.
- **Typography**: font families, sizes, weights, line heights.
- **Spacing and padding**: margins, gaps, whitespace.
- **Border styles**: radius, width, colors.
- **Shadows and elevation effects**.

## Interactive Elements
- **Button styles**: primary, secondary, disabled states.
- **Hover, focus, and active states**.
- **Input fields and form controls**.
- **Dropdowns and select menus**.
- **Tooltips and popovers**.
- **Loading indicators and animations**.

## Layout and Structure
- **Grid systems and alignment**.
- **Card designs and containers**.
- **Section headers and dividers**.
- **Navigation patterns**.
- **Responsive breakpoints**.

## Content Presentation
- **Table styles**: headers, rows, borders, alternating colors.
- **List formatting**: bullets, numbering, indentation.
- **Icon usage and sizing**.
- **Image treatments**.
- **Error and success message styling**.

## User Feedback
- **Validation messages**: error, warning, success.
- **Toast notifications**.
- **Modal dialogs**.
- **Confirmation prompts**.
- **Empty states and placeholders**.

## Audit and Implementation
1. **Identify inconsistencies**: Systematically check each page and component.
2. **Define a unified design system**: Update `index.css` with CSS variables for all tokens.
3. **Implement changes**: Refactor components to use the unified design system.
