-- DropForeignKey
ALTER TABLE "public"."book_copies" DROP CONSTRAINT "book_copies_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."books" DROP CONSTRAINT "books_author_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."borrow_records" DROP CONSTRAINT "borrow_records_book_copy_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."borrow_records" DROP CONSTRAINT "borrow_records_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reservations" DROP CONSTRAINT "reservations_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reservations" DROP CONSTRAINT "reservations_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."authors" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."books" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."books" ADD CONSTRAINT "books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_copies" ADD CONSTRAINT "book_copies_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_records" ADD CONSTRAINT "borrow_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."borrow_records" ADD CONSTRAINT "borrow_records_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "public"."book_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservations" ADD CONSTRAINT "reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
