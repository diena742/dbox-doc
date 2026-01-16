import { apiRequest } from "./client.js";

// ambil detail drama
export async function getDramaDetail(bookId, needRecommend = false) {
  const res = await apiRequest(
    "/drama-box/chapterv2/detail",
    {
      needRecommend,
      from: "book_album",
      bookId
    }
  );
  return res.data;
}


export async function getDetailsv2(bookId) {
  const data = await apiRequest(`/webfic/book/detail/v2?id=${bookId}&language=in`, {
    id: bookId,
    language: 'in'
  }, true, 'get');
  const columnList = data?.data || [];
  return columnList;
};

export async function TestFunc(bookId, index = 1) {
  const res = await apiRequest(
    "/drama-box/chapterv2/batch/load",
    {
      bookId
    }
  );
  return res.data;
}
// ambil batch download url
export async function batchDownload(bookId, chapterIdList) {
  const res = await apiRequest(
    "/drama-box/chapterv2/batchDownload",
    {
      bookId,
      chapterIdList
    }
  );
  return res.data;
}
