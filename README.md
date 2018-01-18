cloud function


```
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

exports.rssGET2 = function rssGET2 (req, res) {
  const http = require("http");
  var url ='http://www.ttc.ca/RSS/Service_Alerts/index.rss';

  http.get(url, request => {
    request.setEncoding("utf8");
    let body = "";
    request.on("data", data => {
      body += data;
    });
    request.on("end", () => {
      console.log(body);
      res.set('Access-Control-Allow-Origin', "*")
      res.set('Access-Control-Allow-Methods', 'GET, POST')
  
      res.send(body);
    });
  });
  
};

exports.rssError2 = function rssError2 (req, res) {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET')
  res.status(400).send('No message defined!');
};

exports.noData2 = function noData2 (req, res) {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET')
  res.status(200).send('not rss!');
};
```