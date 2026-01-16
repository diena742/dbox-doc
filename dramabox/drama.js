import { apiRequest } from "./client.js";

export const getDramaList = async (pageNo = 1, log = false) => {
    const data = await apiRequest("/webfic/home/browse", {
        typeTwoId: 0,
        pageNo,
        pageSize: 10
      }, true);
    const columnList = data?.data || [];
    return columnList;
};

export const getCategories = async (pageNo = 1) => {
    const data = await apiRequest("/webfic/home/browse", {
        typeTwoId: 0,
        pageNo,
        pageSize: 30
      }, true);
    const categories = data?.data?.types || [];
    return categories;
};

export const getBookFromCategories = async (typeTwoId = 0, pageNo = 1) => {
    const data = await apiRequest("/webfic/home/browse", {
        typeTwoId,
        pageNo,
        pageSize: 10
      }, true);
    const categories = data?.data || [];
    return categories;
}

export const getRecommendedBooks = async (log = false) => {
    const data = await apiRequest("/webfic/home/browse", {
        typeTwoId: 0,
        pageNo: 1,
        pageSize: 10
    }, true);

    const rawList = data?.data?.recommends || [];

    // 🔥 Flatten: kalau cardType = 3 (tagCardVo), ambil tagBooks-nya
    const list = rawList.flatMap(item => {
        if (item.cardType === 3 && item.tagCardVo?.tagBooks) {
            return item.tagCardVo.tagBooks;
        }
        return [item];
    });

    // 🧹 Hapus duplikat berdasarkan bookId
    const uniqueList = list.filter(
        (v, i, arr) => arr.findIndex(b => b.bookId === v.bookId) === i
    );

    if (log) {
        console.log("\n=== ⭐ REKOMENDASI DRAMA ===");
        uniqueList.forEach((book, i) => {
            console.log(`${i + 1}. ${book.bookName} (ID: ${book.bookId})`);
        });
    }

    return rawList;
};
