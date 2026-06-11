package com.sudoku.adventure;

public class SudokuValidator {
    public static boolean isValidGrid(int[] board) {
        return board.length == 81 && rowsValid(board) && columnsValid(board) && blocksValid(board);
    }

    private static boolean rowsValid(int[] board) {
        for (int row = 0; row < 9; row++) {
            boolean[] used = new boolean[10];
            for (int col = 0; col < 9; col++) {
                int value = board[row * 9 + col];
                if (value != 0) {
                    if (value < 1 || value > 9 || used[value]) {
                        return false;
                    }
                    used[value] = true;
                }
            }
        }
        return true;
    }

    private static boolean columnsValid(int[] board) {
        for (int col = 0; col < 9; col++) {
            boolean[] used = new boolean[10];
            for (int row = 0; row < 9; row++) {
                int value = board[row * 9 + col];
                if (value != 0) {
                    if (value < 1 || value > 9 || used[value]) {
                        return false;
                    }
                    used[value] = true;
                }
            }
        }
        return true;
    }

    private static boolean blocksValid(int[] board) {
        for (int blockRow = 0; blockRow < 3; blockRow++) {
            for (int blockCol = 0; blockCol < 3; blockCol++) {
                boolean[] used = new boolean[10];
                for (int row = 0; row < 3; row++) {
                    for (int col = 0; col < 3; col++) {
                        int value = board[(blockRow * 3 + row) * 9 + (blockCol * 3 + col)];
                        if (value != 0) {
                            if (value < 1 || value > 9 || used[value]) {
                                return false;
                            }
                            used[value] = true;
                        }
                    }
                }
            }
        }
        return true;
    }
}
