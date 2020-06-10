$(document).ready(function(){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=test",
        dataType: "json",
        success: function (json) {
            if(json.username!=null){
                $(".myaccount:hover .dropdown-content").css("display", "block");
                $(".dropdown p").html("My account<img src='../img/myaccount.png' >");
                $(".dropdown p img").css("filter", "invert(0%)");
                $(".dropdown").attr("href", "");
            }else{
                window.location.href = "./login.html";
            }
        }
    });
});