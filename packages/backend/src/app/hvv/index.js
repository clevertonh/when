const crypto = require('crypto');
const https = require('https');

module.exports.hvvRequest = hvvRequest = (method, body) => {
  return new Promise((resolve, reject) => {
    //Set HVV API Version
    body.version = process.env.HVV_API_VERSION;
    body = JSON.stringify(body);
    //Generate hash needed for hvv api server authentication
    const hash = crypto
      .createHmac('sha1', process.env.HVV_API_KEY)
      .update(body)
      .digest('base64');

    const options = {
      hostname: `api-test.geofox.de`,
      path: `/gti/public/${method}`,
      port: 443,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'geofox-auth-type': 'HmacSHA1',
        Connection: 'Keep-Alive',
        'geofox-auth-user': 'eliashuehne',
        'geofox-auth-signature': hash
      },
      body: body
    };

    let json = '';
    const req = https.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => (json += chunk));
      res.on('end', () => {
        console.log(`Request to HVV-API successful with method ${method}`);
        resolve(JSON.parse(json));
      });
    });
    req.on('error', e => {
      console.error(`Request to HVV-API failed with ${e}`);
      reject(json);
    });
    req.write(body);
    req.end();
  });
};

module.exports.getStation = name => {
  if (name === '') {
    return {};
  }

  const params = {
    theName: {
      name,
      type: 'STATION'
    },
    maxList: 1
  };

  return hvvRequest('checkName', params);
};

module.exports.requestOptions = (connection, event) => ({
  version: 36,
  language: 'de',
  start: connection.start,
  dest: connection.end,
  time: {
    date: 'heute',
    time: event.time.hour + ':' + event.time.minute
  },
  timeIsDeparture: true,
  schedulesBefore: 0,
  schedulesAfter: 0,
  realtime: 'REALTIME'
});
