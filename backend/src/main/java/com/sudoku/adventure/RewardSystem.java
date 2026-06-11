package com.sudoku.adventure;

public class RewardSystem {
    public static int calculateStars(int timeSeconds, int mistakes) {
        if (mistakes == 0 && timeSeconds <= 120) {
            return 3;
        }
        if (timeSeconds <= 220) {
            return 2;
        }
        return 1;
    }

    public static int calculateCoins(int stars) {
        return 10 + stars * 5;
    }
}
