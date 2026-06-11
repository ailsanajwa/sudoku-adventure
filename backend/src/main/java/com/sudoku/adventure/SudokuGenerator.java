package com.sudoku.adventure;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class SudokuGenerator {
    private static final int SIZE = 9;
    private static final Random RANDOM = new Random();

    public static int[] createSolvedBoard() {
        int[] board = new int[SIZE * SIZE];
        fillBoard(board, 0);
        return board;
    }

    public static int[] createPuzzle(int[] solution, int removedCount) {
        int[] puzzle = solution.clone();
        List<Integer> positions = new ArrayList<>();
        for (int i = 0; i < SIZE * SIZE; i++) {
            positions.add(i);
        }
        Collections.shuffle(positions, RANDOM);
        for (int i = 0; i < Math.min(removedCount, positions.size()); i++) {
            puzzle[positions.get(i)] = 0;
        }
        return puzzle;
    }

    private static boolean fillBoard(int[] board, int index) {
        if (index == SIZE * SIZE) {
            return true;
        }

        List<Integer> values = new ArrayList<>();
        for (int i = 1; i <= SIZE; i++) {
            values.add(i);
        }
        Collections.shuffle(values, RANDOM);

        for (int value : values) {
            if (canPlace(board, index, value)) {
                board[index] = value;
                if (fillBoard(board, index + 1)) {
                    return true;
                }
                board[index] = 0;
            }
        }
        return false;
    }

    private static boolean canPlace(int[] board, int index, int value) {
        int row = index / SIZE;
        int col = index % SIZE;

        for (int x = 0; x < SIZE; x++) {
            if (board[row * SIZE + x] == value) {
                return false;
            }
            if (board[x * SIZE + col] == value) {
                return false;
            }
        }

        int blockRow = (row / 3) * 3;
        int blockCol = (col / 3) * 3;
        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 3; c++) {
                if (board[(blockRow + r) * SIZE + blockCol + c] == value) {
                    return false;
                }
            }
        }

        return true;
    }
}
