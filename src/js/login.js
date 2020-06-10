$(document).ready(function(){
    $(".button").on('click',null,function(){
        var username=$("#username").val();
        var password=$("#passwd").val();
        if(username==""){
            $(".msg").html("Username/E-mail is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#username").focus();
            return false;
        }
        else if(password==""){
            $(".msg").html("Password is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#passwd").focus();
            return false;
        }
        else{
            $.ajax({
                type: "POST",
                url: "./php/ajax.php?action=login",
                data: {
                    "username":username,
                    "password":password
                },
                dataType: "json",
                success: function (json) {
                    if(json.status==1){
                        $(".msg").html("Login success! Jump in 1 second");
                        $(".msg").css("display", "block");
                        $(".msg").css("color", "green");
                        setTimeout(function(){
                            window.location.href = "../index.html";
                        },1000);
                    }
                    else{
                        $(".msg").html(json.msg);
                        $(".msg").css("display", "block");
                        $(".msg").css("color", "red");
                        return false;
                    }
                }
            });
        }
    });
});