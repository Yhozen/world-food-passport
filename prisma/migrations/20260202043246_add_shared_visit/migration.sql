-- CreateTable
CREATE TABLE "shared_visits" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "restaurant_id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "share_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_visit_members" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "shared_visit_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_visit_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_visits_restaurant_id_key" ON "shared_visits"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_visits_share_code_key" ON "shared_visits"("share_code");

-- CreateIndex
CREATE UNIQUE INDEX "shared_visit_members_shared_visit_id_user_id_key" ON "shared_visit_members"("shared_visit_id", "user_id");

-- AddForeignKey
ALTER TABLE "shared_visits" ADD CONSTRAINT "shared_visits_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_visit_members" ADD CONSTRAINT "shared_visit_members_shared_visit_id_fkey" FOREIGN KEY ("shared_visit_id") REFERENCES "shared_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
