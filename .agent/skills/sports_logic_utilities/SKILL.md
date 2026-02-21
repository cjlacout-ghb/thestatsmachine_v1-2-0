---
name: sports_logic_utilities
description: Specialized innings handling (X.1, X.2), fractional-to-out conversions, and game-play logical constraints (Softball/Baseball focus).
---

# Sports Logic Utilities Skill

This skill provides expert handling for specialized data formats and logical business rules common in diamond sports (Softball/Baseball).

## 1. Innings Handling (The X.1/X.2 Format)

In diamond sports, innings are recorded in thirds. This skill standardizes the "decimal" representation:
- `7.0` = 7 innings (21 outs)
- `7.1` = 7 innings and 1 out (22 outs)
- `7.2` = 7 innings and 2 outs (23 outs)

### Conversion Rules:
-   **Always convert to "Outs" for math**: Performing division or averages directly on `7.1` will lead to incorrect results. `7.1` should be treated as `7 + 1/3`.
-   **Precision**: Use `Math.round()` on decimal remainders to prevent floating-point errors during string-to-number transitions.
-   **Display**: Provide utilities to convert total "Outs" back to the `.1/.2` format for user clarity.

## 2. Game-Play Logical Constraints

Validation must ensure the data represents a legal game scenario:

### The Home Team Advantage
-   **Winning Home Team**: If the Home Team leads at the end of the Visitor's half of the final inning, the Home Team does not bar in the bottom half. 
    -   *Rule*: `Innings_Home_Batting <= Innings_Visitor_Batting`.
-   **Losing Home Team**: If the Home Team loses, they must have completed their final half-inning.
    -   *Rule*: `Innings_Home_Batting == Innings_Visitor_Batting`.

### Scoring Integrity
-   **Earned Runs**: By definition, `Earned Runs <= Total Runs`.
-   **Defensive Synchronization**: A team's "Innings at Bat" must always equal the opponent's "Innings on Defense."

## 3. Best Practices

-   **Regex Validation**: Use `/^(\d+)(\.([12]))?$/` to strictly enforce the `.1/.2` format.
-   **Tolerance**: When comparing sports averages (like TQB or ERA), use a tolerance of `0.0001` to account for irrational number comparisons.
-   **Signage**: Always display averages (TQB/BA) with an explicit `+` or `-` sign to improve scannability in rankings.

---

## Resources

- [innings_converter.ts](file:///d:/CJL_temporal/_Apps/TQB/TQB_v1-1-0/.agent/skills/sports_logic_utilities/lib/innings_converter.ts): Bi-directional conversion logic.
- [game_rules_validator.ts](file:///d:/CJL_temporal/_Apps/TQB/TQB_v1-1-0/.agent/skills/sports_logic_utilities/lib/game_rules_validator.ts): Template for validating legal game scenarios.
