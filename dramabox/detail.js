import { apiRequest } from "./client.js";

/**
 * 7️⃣ Ambil detail lengkap sebuah drama/book
 * @param {string} bookId - ID drama/book
 * @param {boolean} needRecommend - Apakah sekalian ambil rekomendasi
 * @param {string} from - Asal request (default: "book_album")
 * @param {boolean} log - Tampilkan hasil di console
 */
export const getDramaDetail = async (
    bookId,
    needRecommend = false,
    from = "book_album",
    log = true
) => {
    if (!bookId) {
        throw new Error("bookId wajib diisi!");
    }

    const data = await apiRequest("/drama-box/chapterv2/detail", {
        needRecommend,
        from,
        bookId
    });

    return data;
};
