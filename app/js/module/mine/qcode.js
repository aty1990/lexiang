require(['pm'], function (PM) {
    var serverUrl = sessionStorage.getItem('serverUrl'),
        url = serverUrl+"/wechatPlatform/scanGroup?state=mine-relation&openId="+sessionStorage.getItem('openId');
        $.ajax({
            type: "GET",
            url: "http://api.wwei.cn/wwei.html",
            data:{
                data : url,
                version :　"1.0",
                apikey : 20170630147020,
                xt : 2,
                /*bcolor : "#D50A0A",
                fcolor : "#EA6767",
                icolor : "#62A7EA",*/
                callback : "suc",
                logo : "http://file.hngangxin.com/LX/20170504114045.jpg"
            },
            dataType: "jsonp",
            jsonpCallback: "suc",
            success:function(data){
                $('#imgOne').attr('src',data.data.qr_filepath);  
            }
        });
});