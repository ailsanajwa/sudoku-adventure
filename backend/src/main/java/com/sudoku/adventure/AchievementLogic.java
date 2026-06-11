package com.sudoku.adventure;

import java.util.ArrayList;
import java.util.List;

public class AchievementLogic {
    public static List<String> evaluate(int timeSeconds, int mistakeCount, int hintCount, int stars) {
        List<String> unlocked = new ArrayList<>();
        if (mistakeCount == 0) {
            unlocked.add("No Mistake Run");
        }
        if (timeSeconds <= 90) {
            unlocked.add("Fast Solver");
        }
        if (hintCount >= 3) {
            unlocked.add("Logic Master");
        }
        if (stars == 3) {
            unlocked.add("Perfect Player");
        }
        return unlocked;
    }
}
