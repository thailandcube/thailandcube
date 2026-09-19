/*
  Warnings:

  - You are about to drop the `Competition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Competitor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Round` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'fto';

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_competitor_id_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_round_id_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey";

-- DropTable
DROP TABLE "Competition";

-- DropTable
DROP TABLE "Competitor";

-- DropTable
DROP TABLE "Result";

-- DropTable
DROP TABLE "Round";

-- DropTable
DROP TABLE "User";
