$(document).ready(function(){
    $.ajax({
        type: "POST",
        url: "./src/php/ajax.php?action=test",
        dataType: "json",
        success: function (json) {
            if(json.username!=null){
                $(".myaccount:hover .dropdown-content").css("display", "block");
                $(".dropdown p").html("My account<img src='./img/myaccount.png' >");
                $(".dropdown p img").css("filter", "invert(0%)");
                $(".dropdown").attr("href", "");
            }else{
                $(".dropdown-content").css("display", "none");
                $(".dropdown p").html("Login<img src='./img/login.png' >");
                $(".dropdown p img").css("filter", "invert(100%)");
                $(".dropdown").attr("href", "./src/login.html");
            }
        }
    });
    $("#logout").on('click',null,function(){
        $.ajax({
            type: "POST",
            url: "./src/php/ajax.php?action=logout",
            dataType: "json",
            success: function (json) {
                window.location.href = "./src/login.html";
            }
        });
    });
});