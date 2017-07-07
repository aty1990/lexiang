/**
 * Created by sjin on 17/3/8.
 */
define(['$', 'const'], function ($, CONST) {

  $.httpPost = function (url, params) {
    var httpDefer = $.Deferred();
    doRequest(httpDefer, url, 'post', params);
    return httpDefer.promise();
  };

  $.httpPostServer = function (url, params) {
    var httpDefer = $.Deferred();
    doRequest(httpDefer, url, 'post', params, CONST.SERVER_URL);
    return httpDefer.promise();
  };

  $.httpGet = function (url, params) {
    var httpDefer = $.Deferred();
    doRequest(httpDefer, url, 'get', params);
    return httpDefer.promise();
  };

  $.httpGetServer = function (url, params) {
    var httpDefer = $.Deferred();
    doRequest(httpDefer, url, 'get', params, CONST.SERVER_URL);
    return httpDefer.promise();
  };

  var doRequest = function (httpDefer, url, method, params, serverUrl) {
    serverUrl = serverUrl || CONST.SERVER_API_URL;

    // 为 url 添加 .json
    url = checkDotJSON(url);

    var options = {
      url: serverUrl + url,
      type: method,
      data: params,
      dataType: 'json',
      success: function (data, status, xhr) {
        var code = data.code != null ? data.code : data.resultCode,
            message = data.message != null ? data.message : data.resultMessage,
            mainData = data.data != null ? data.data : data.resultEntity;
        if (code == 0) {
          httpDefer.resolve(mainData);
        } else {
          httpDefer.resolve(data);
        }
      },
      error: function (xhr, errorType, error) {
        httpDefer.reject(error);
      }
    };

    $.ajax(options);
  };

  var checkDotJSON = function (url) {
    var suffix = '.json';
    if (!~url.indexOf(suffix)) {
      var index = url.indexOf('?');
      if (!!~index) {
        url = url.split('');
        url.splice(index, 0, suffix);
        url = url.join('');
      } else {
        url += suffix;
      }
    }
    return url;
  }

});