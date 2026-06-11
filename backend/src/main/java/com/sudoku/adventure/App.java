package com.sudoku.adventure;

import java.util.Arrays;

public class App {
    public static void main(String[] args) {
        int[] solution = SudokuGenerator.createSolvedBoard();
        int[] puzzle = SudokuGenerator.createPuzzle(solution, 42);

        System.out.println("Sudoku Adventure backend ready.");
        System.out.println("Generated puzzle:");
        System.out.println(Arrays.toString(puzzle));
        System.out.println("Is valid puzzle? " + SudokuValidator.isValidGrid(puzzle));
        System.out.println("Star reward for 2 mistakes in 150 seconds: " + RewardSystem.calculateStars(150, 2));
    }
}
