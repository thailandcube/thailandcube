-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERUSER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('333', '222', '444', '555', '666', '777', '333bf', '333fm', '333oh', 'clock', 'minx', 'pyram', 'skewb', 'sq1', '444bf', '555bf', '333mbf');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('BO1', 'BO2', 'BO3', 'MO3', 'AO5', 'BO5', 'H2H');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WAITING_LIST', 'DELETED');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('SINGLE', 'AVERAGE');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('ACTIVE', 'DROPOUT');

-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('CHAMPION', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'CORRECT', 'PODIUM', 'INCORRECT');

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor" (
    "id" SERIAL NOT NULL,
    "wca_id" TEXT,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'TH',
    "user_id" INTEGER,

    CONSTRAINT "competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration" (
    "id" SERIAL NOT NULL,
    "competition_id" TEXT NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "status" "RegistrationStatus" NOT NULL,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_event" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "registration_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition" (
    "id" TEXT NOT NULL,
    "proposal_id" INTEGER,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "name_reason" TEXT,
    "venue" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "event" "EventType" NOT NULL,
    "competition_id" TEXT NOT NULL,
    "max_age" INTEGER,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "time_limit" DOUBLE PRECISION NOT NULL DEFAULT 600.0,
    "cutoff" DOUBLE PRECISION,
    "proceed" DOUBLE PRECISION,
    "tournament_url" TEXT,
    "format" "Format" NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'ACTIVE',
    "display" TEXT,
    "attempts" DOUBLE PRECISION[],
    "result" DOUBLE PRECISION,
    "best" DOUBLE PRECISION,

    CONSTRAINT "result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "national_record" (
    "id" SERIAL NOT NULL,
    "holder" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "caption" TEXT,
    "event" "EventType" NOT NULL,
    "result" TEXT NOT NULL,
    "type" "RecordType" NOT NULL,
    "image_file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "image_data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "national_record_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "competitor_wca_id_key" ON "competitor"("wca_id");

-- CreateIndex
CREATE UNIQUE INDEX "competitor_user_id_key" ON "competitor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_competitor_id_competition_id_key" ON "registration"("competitor_id", "competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_event_registration_id_event_id_key" ON "registration_event"("registration_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_proposal_id_key" ON "competition"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_name_key" ON "competition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_event_competition_id_max_age_key" ON "event"("event", "competition_id", "max_age");

-- CreateIndex
CREATE UNIQUE INDEX "round_event_id_round_key" ON "round"("event_id", "round");

-- CreateIndex
CREATE UNIQUE INDEX "result_competitor_id_round_id_key" ON "result"("competitor_id", "round_id");

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
ALTER TABLE "competitor" ADD CONSTRAINT "competitor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_event" ADD CONSTRAINT "registration_event_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_event" ADD CONSTRAINT "registration_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
