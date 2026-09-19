-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('CHAMPION', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'CORRECT', 'PODIUM', 'INCORRECT');

-- CreateTable
CREATE TABLE "prediction_form" (
    "competition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_thai_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_form_pkey" PRIMARY KEY ("competition_id")
);

-- CreateTable
CREATE TABLE "prediction_event_competitor" (
    "id" SERIAL NOT NULL,
    "prediction_form_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wca_id" TEXT,
    "country_iso2" TEXT NOT NULL,
    "event" "EventType" NOT NULL,
    "pos" INTEGER NOT NULL,

    CONSTRAINT "prediction_event_competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_submissions" (
    "id" SERIAL NOT NULL,
    "prediction_form_id" TEXT NOT NULL,
    "user_id" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "wca_id" TEXT,
    "wants_prize" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_records" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "event" "EventType" NOT NULL,
    "placement" "Placement" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "predicted_cuber_id" INTEGER NOT NULL,
    "status" "PredictionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "prediction_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_answers" (
    "id" SERIAL NOT NULL,
    "prediction_form_id" TEXT NOT NULL,
    "event" "EventType" NOT NULL,
    "placement" "Placement" NOT NULL,
    "actual_cuber_id" INTEGER NOT NULL,

    CONSTRAINT "prediction_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_form_competition_id_key" ON "prediction_form"("competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_event_competitor_prediction_form_id_name_event_key" ON "prediction_event_competitor"("prediction_form_id", "name", "event");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_submissions_user_id_prediction_form_id_key" ON "prediction_submissions"("user_id", "prediction_form_id");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_records_submission_id_event_placement_key" ON "prediction_records"("submission_id", "event", "placement");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_answers_prediction_form_id_event_placement_key" ON "prediction_answers"("prediction_form_id", "event", "placement");

-- AddForeignKey
ALTER TABLE "prediction_event_competitor" ADD CONSTRAINT "prediction_event_competitor_prediction_form_id_fkey" FOREIGN KEY ("prediction_form_id") REFERENCES "prediction_form"("competition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_submissions" ADD CONSTRAINT "prediction_submissions_prediction_form_id_fkey" FOREIGN KEY ("prediction_form_id") REFERENCES "prediction_form"("competition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_submissions" ADD CONSTRAINT "prediction_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_records" ADD CONSTRAINT "prediction_records_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "prediction_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_records" ADD CONSTRAINT "prediction_records_predicted_cuber_id_fkey" FOREIGN KEY ("predicted_cuber_id") REFERENCES "prediction_event_competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_answers" ADD CONSTRAINT "prediction_answers_prediction_form_id_fkey" FOREIGN KEY ("prediction_form_id") REFERENCES "prediction_form"("competition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_answers" ADD CONSTRAINT "prediction_answers_actual_cuber_id_fkey" FOREIGN KEY ("actual_cuber_id") REFERENCES "prediction_event_competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

