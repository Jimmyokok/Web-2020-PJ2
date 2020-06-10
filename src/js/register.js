$(document).ready(function(){
    var flgu,flgp1,flgp2;
    function check(){
        var reg=/[A-Za-z0-9_]+$/;
        var regweak=/[A-Za-z0-9]+$/;
        var reg_email=/^([a-zA-Z0-9_-])+@(([a-z]+\.)+)([a-z]{2,4})/;
        var str=$("#password").val();
        var str2=$("#password2").val();
        var username=$("#username").val();
        var email=$("#email").val();
        if(username.length>255&&flgu){
            $(".msg").html("Username too long!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(email.length>255&&flge){
            $(".msg").html("E-mail too long!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(email.replace(reg_email,"")!=""&&flge){
            $(".msg").html("Invalid E-mail!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(str.length<6&&flgp1){
            $(".msg").html("Password too short!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(str.length>18&&flgp1){
            $(".msg").html("Password too long!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if((str.replace(reg,"")!=""&&flgp1)||(flgp2&&str=="")){
            $(".msg").html("Invalid password!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(str.replace(regweak,"")==""&&flgp1){
            $(".msg").html("Password is too weak!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else if(str!=str2&&flgp1&&flgp2){
            $(".msg").html("Password mismatch!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else{
            $(".msg").html("");
            $(".msg").css("display", "none");
            $(".msg").css("color", "green");
            return false;
        }
    };
    $("#password").on('input propertychange',null,function(){
        flgp1=true;
        check();
    });
    $("#password2").on('input propertychange',null,function(){
        flgp2=true;
        check();
    });
    $("#username").on('input propertychange',null,function(){
        flgu=true;
        check();
    });
    $("#email").on('input propertychange',null,function(){
        flge=true;
        check();
    });
    $(".button").on('click',null,function(){
        var email=$("#email").val();
        var username=$("#username").val();
        var password=$("#password").val();
        var password2=$("#password2").val();
        if(username==""){
            $(".msg").html("Username is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#username").focus();
            return false;
        }
        else if(email==""){
            $(".msg").html("E-mail is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#email").focus();
            return false;
        }
        else if(password==""){
            $(".msg").html("Password is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#passwd").focus();
            return false;
        }
        else if(password2==""){
            $(".msg").html("Password is empty!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            $("#passwd").focus();
            return false;
        }
        else if(password2!=password){
            $(".msg").html("Password mismatch!");
            $(".msg").css("display", "block");
            $(".msg").css("color", "red");
            return false;
        }
        else{
            $.ajax({
                type: "POST",
                url: "./php/ajax.php?action=register",
                data: {
                    "username":username,
                    "email":email,
                    "password":password
                },
                dataType: "json",
                success: function (json) {
                    if(json.status==1){
                        $(".msg").html("Register success! Jump in 1 second");
                        $(".msg").css("display", "block");
                        $(".msg").css("color", "green");
                        setTimeout(function(){
                            window.location.href = "./login.html";
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