require(['pm'], function (PM) {
    var stateParam = PM.stateParam;
    var serverUrl = sessionStorage.getItem('serverUrl');
    $(".openId").html(stateParam.openId);
    $(".groupOpenId").html(sessionStorage.getItem('openId'));
});