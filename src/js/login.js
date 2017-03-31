;
(function ($, window, document, undefined) {
    var vkey = "bi_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10);

    function initLogin() {
        $("#captcha_img").attr("src", App.href + "/api/noneAuth/captcha?vkey=" + vkey);
        $("#captcha_a").on("click", function () {
            vkey = "bi_" + new Date().getTime() + "_" + Math.floor(Math.random() * 10);
            $("#captcha_img").attr("src", App.href + "/api/noneAuth/captcha?vkey=" + vkey + "&s=" + new Date().getTime());
        });
        $('#username,#password,#vcode').bind('keypress', function (event) {
            if (event.keyCode == "13") {
                login();
            }
        });
        $("#login_btn").on("click", login);
    }

    var login = function () {
        if ($("#username").val() == "" || $("#username").val() == "" || $("#vcode").val() == "") {
            alert("登录名,密码,验证码不能为空!");
            return;
        }
        var fields = JSON.stringify(
            {
                "username": $("#username").val(),
                "password": $("#password").val(),
                "vcode": $("#vcode").val(),
                "vkey": vkey
            });
        $.ajax({
            type: 'POST',
            url: App.href + "/api/token/generate",
            contentType: "application/json",
            dataType: "json",
            data: fields,
            success: function (result) {
                if (result.code === 200) {
                    $.cookie('tc_t', result.token, {expires: 7});
                    window.location.href = App.href;
                } else {
                    alert(result.message);
                }
            }
        });
    };
    $(document).ready(function () {
        initLogin();
    });
})(jQuery, window, document);