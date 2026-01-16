import { apiRequest } from "./client.js";

export const searchDrama = async (keyword, log = false) => {
    const data = await apiRequest("/drama-box/search/suggest", { keyword, pageNo: 3 });

    const list = data?.data?.suggestList || [];

    return list;
};

export const searchDramaIndex = async (log = false) => {
    const data = await apiRequest("/drama-box/search/index");

    const indexList = data?.data?.hotVideoList || [];
    return indexList;
};
