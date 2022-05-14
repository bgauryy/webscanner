const geoip = require('geoip-lite');
const LOG = require('./logger');

const dataURIRegex = /^data:/;

function getInitiator(initiator) {
  if (initiator.type === 'parser') {
    return 'parser';
  } else if (initiator.type === 'other') {
    return 'other';
  }

  const frames = getInitiatorFromStack(initiator.stack);

  for (let i = 0; i < frames.length; i++) {
    const callFrames = frames[i];
    for (let j = 0; j < callFrames.length; j++) {
      if (callFrames[j].scriptId) {
        return callFrames[j].scriptId;
      }
    }
  }

  function getInitiatorFromStack(frame, frames) {
    frames = frames || [];

    //TODO - fix!
    if (!frame) {
      return '';
    }
    frames.unshift(frame.callFrames);

    if (!frame.parent) {
      return frames;
    } else {
      return getInitiatorFromStack(frame.parent, frames);
    }
  }
}

function enrichURLDetails(obj, urlProp) {
  if (!obj || !obj[urlProp]) {
    return;
  }

  try {
    const urlObj = new URL(obj[urlProp]);
    obj.host = urlObj.host || undefined;
    obj.pathname = urlObj.pathname || undefined;
    obj.port = urlObj.port || undefined;
    obj.path = urlObj.path || undefined;
    obj.query = urlObj.query || undefined;
  } catch (e) {
    //ignore
  }
}

function reduceDeepObject(obj, headersProp, prefix) {
  const headers = obj && obj[headersProp];
  if (!headers) {
    return;
  }
  //eslint-disable-next-line
    for (const prop in headers) {
    obj[`${prefix}_${prop}`] = headers[prop];
  }
  delete obj[headersProp];
}

function enrichIPDetails(obj, IPProp) {
  if (!obj || !obj[IPProp]) {
    return;
  }
  const ip = obj[IPProp];

  try {
    const lookup = geoip.lookup(ip);
    obj.country = lookup.country; // 2 letter ISO-3166-1 country code
    obj.region = lookup.region; // Up to 3 alphanumeric variable length characters as ISO 3166-2 code
    obj.timezone = lookup.timezone; // Timezone from IANA Time Zone Database
    obj.city = lookup.city; // This is the full city name
    obj.location = Array.isArray(lookup.ll) && lookup.ll.join(','); //latitude, longitude
    obj.ipRange = Array.isArray(lookup.range) && lookup.range.join(','); //Low IP, High IP
    obj.fromEurope = lookup.eu === '1';
  } catch (e) {
    LOG.error(e);
  }
}

function isDataURI(url) {
  return dataURIRegex.test(url);
}

function isEmptyValue(value) {
  if (typeof value === 'boolean') {
    return false;
  } else if (value === null || value === undefined) {
    return true;
  } else if (typeof value === 'string' && !value) {
    return true;
  } else if (typeof value === 'number' && !Number.isFinite(value)) {
    return true;
  } else if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
}

function isRangeContains(p1, p2) {
  const isStartUnion =
    p1.startOffset <= p2.startOffset &&
    p1.endOffset <= p2.endOffset &&
    p1.endOffset >= p2.startOffset;
  const isEndUnion =
    p1.endOffset >= p2.endOffset &&
    p1.startOffset >= p2.startOffset &&
    p1.startOffset <= p2.endOffset;
  const isUnion =
    (p1.startOffset > p2.startOffset && p1.endOffset < p2.endOffset) ||
    (p1.startOffset < p2.startOffset && p1.endOffset > p2.endOffset);
  return isStartUnion || isEndUnion || isUnion;
}

function getRandomString() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 16; i++) {
    rand += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return rand;
}

function cleanObject(data, depth) {
  if (typeof depth !== 'number') {
    depth = 0;
  }
  if (depth < 0) {
    return;
  }
  depth--;
  for (const prop in data) {
    if (isEmptyValue(data[prop])) {
      delete data[prop];
    } else if (data[prop] && typeof data[prop] === 'object') {
      cleanObject(data[prop], depth);
    }
  }
}

module.exports = {
  getInitiator,
  enrichURLDetails,
  enrichIPDetails,
  isDataURI,
  isEmptyObject: isEmptyValue,
  reduceDeepObject,
  isRangeContains,
  getRandomString,
  cleanObject,
};
