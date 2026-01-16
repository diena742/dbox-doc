import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { DramaboxApp } from "./sign.js";

// Use Web Crypto API for Workers compatibility
function randomAndroidId() {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return "ffffffff" + hex + "000000000";
}

export const getToken = async (payload, timestamp) => {
  try {
    const url = `https://sapi.dramaboxdb.com/drama-box/ap001/bootstrap?timestamp=${timestamp}`;
    const deviceId = uuidv4(35);
    const androidId = randomAndroidId();
    const headers = {
      "User-Agent": "okhttp/4.10.0",
      "Accept-Encoding": "gzip",
      "Content-Type": "application/json",
      "tn": "",
      "version": "430",
      "vn": "4.3.0",
      "cid": "DRA1000042",
      "package-name": "com.storymatrix.drama",
      "apn": "1",
      "device-id": deviceId,
      "android-id": androidId,
      "language": "in",
      "current-language": "in",
      "p": "43",
      "time-zone": "+0800",
      "content-type": "application/json; charset=UTF-8"
    };

    const body = JSON.stringify({ distinctId: null });
    const res = await axios.post(url, { distinctId: null }, {headers});

    if(!res.data?.data?.user){
      return await getToken(payload, timestamp);
    }
    const tokenData = {
      token: res.data.data.user.token,
      deviceId,
      androidId,
      uuid: res.data.data.user.uid,
      attributionPubParam: res.data.data.attributionPubParam,
      timestamp: Date.now(),
    };

    return tokenData;
  } catch (error) {
    console.error("[ERROR] Gagal mengambil token:", error);
    throw error;
  }
};

/**
 * Generate headers lengkap siap pakai
 */
export const getHeaders = async (payload, timestamp) => {
  const { token, deviceId, androidId, uuid} = await getToken(payload, timestamp);
  const headers = {
    "Host": "sapi.dramaboxdb.com",
    "tn": `Bearer ${token}`,
    "Version": "430",
    "Vn": "4.3.0",
    "Cid": "DALPF1057826",
    "Package-Name": "com.storymatrix.drama",
    "Apn": "1",
    "device-id": deviceId,
    "Language": "in",
    "Current-Language": "in",
    "P": "43",
    "Time-Zone": "+0800",
    "md": "Redmi Note 8",
    "Ov": "14",
    "android-id": androidId,
    "Mf": "XIAOMI",
    "Brand": "Xiaomi",
    "Content-Type": "application/json; charset=UTF-8",
    "User-Agent": "okhttp/4.10.0",
  };
  const body = JSON.stringify(payload);
  return headers;
};

export default { getToken, getHeaders };
