using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace C_
{
    class Program
    {
        private static void DisplayBoard(int[,] board) {
            int boardSize = board.GetLength(0);
            var messageFormat = "{0}  ";
            var rowSeparator = "                     ";
            var columnSeparator = "  ";

            for (var row = 0; row < boardSize; row++) {
                if (row % 3 == 0 && row != 0) {
                    Console.WriteLine(rowSeparator);
                }

                for (var column = 0; column < boardSize; column++) {
                    if (column % 3 == 0 && column != 0) {
                        Console.Write(columnSeparator);
                    }

                    Console.Write(messageFormat, board[row, column]);
                }
                
                Console.WriteLine();
            }
        }

        private static int[,] CreateEmptyBoard(int boardSize) {
            int[,] emptyBoard = new int[boardSize, boardSize];

            for (var row = 0; row < 9; row++) {
                for (var column = 0; column < 9; column++) {
                    emptyBoard[row, column] = 0;
                }
            }

            return emptyBoard;
        }

        private static int[] findNextEmpty(int[,] board) {
            for (var row = 0; row < 9; row++) {
                for (var column = 0; column < 9; column++) {
                    if (board[row, column] == 0) {
                        return new int[] {row, column};
                    }
                }
            }

            return null;
        } 

        private static bool IsPossible(int[,] board, int[] cellCoordinates, int number) {
            int rowIndex = cellCoordinates[0];
            int columnIndex = cellCoordinates[1];
            int boxRow = (rowIndex / 3) * 3;
            int boxColumn = (columnIndex / 3) * 3;

            for (var index = 0; index < 9; index++) {
                if ((board[rowIndex, index] == number) && (columnIndex != index)) {
                    return false;
                }
            }

            for (var index = 0; index < 9; index++) {
                if ((board[index, columnIndex] == number) && (rowIndex != index)) {
                    return false;
                }
            }

            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if ((board[boxRow + i, boxColumn + j] == number) && (i, j) != (rowIndex, columnIndex)) {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool SolveBoard(int[,] board) {
            int[] emptyCellCoordinates = findNextEmpty(board);

            if (emptyCellCoordinates is null) {
                return true;
            } 

            for (var number = 1; number < 10; number++) {
                if (IsPossible(board, emptyCellCoordinates, number)) {
                    board[emptyCellCoordinates[0], emptyCellCoordinates[1]] = number;

                    if (SolveBoard(board)) {
                        return true;
                    }
                        
                    board[emptyCellCoordinates[0], emptyCellCoordinates[1]] = 0;
                }
            }

            return false;
        }

        static void Main(string[] args)
        {
            //int[,] board = CreateEmptyBoard(9);
            Stopwatch stopwatch = new Stopwatch();

            int[,] board = new int[,]{
                {6, 4, 0, 0, 3, 0, 0, 0, 7},
                {5, 0, 1, 0, 7, 0, 9, 0, 0},
                {0, 0, 0, 0, 0, 0, 0, 1, 0},
                {0, 0, 4, 9, 0, 8, 0, 6, 0},
                {0, 8, 0, 0, 0, 3, 0, 2, 0},
                {0, 0, 0, 4, 0, 0, 0, 0, 0},
                {4, 0, 0, 1, 5, 7, 0, 3, 0},
                {2, 0, 8, 3, 0, 0, 0, 4, 0},
                {7, 5, 0, 0, 0, 0, 0, 9, 6},
            };

            DisplayBoard(board);
            Console.WriteLine();
            Console.WriteLine();

            
            stopwatch.Start();

            SolveBoard(board);

            stopwatch.Stop();

            TimeSpan stopwatchElapsed = stopwatch.Elapsed;

            DisplayBoard(board);
            Console.WriteLine(stopwatchElapsed.TotalMilliseconds);
        }
    }
}
