
function favor(type,path){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=favor",
        data:{
            "type":type,
            "path":path
        },
        dataType: "json",
        success: function (json) {
            updatepic(json['path']);
        }
    });
}
function updatepic(path){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=getdetails",
        data:{
            "path":path
        },
        dataType: "json",
        success: function (json) {
            document.querySelectorAll(".image img")[0].setAttribute("src","../img/normal/medium/"+path);
            document.querySelectorAll(".redfont")[0].innerHTML=json['likenumber'];
            document.querySelectorAll(".bigfont")[0].innerHTML=json['title'];
            document.querySelectorAll(".smallfont")[0].innerHTML="by "+json['username'];
            document.querySelectorAll(".desc")[0].innerHTML=json['desc'];
            document.querySelectorAll(".catagory")[0].innerHTML="Content : "+json['content'];
            document.querySelectorAll(".catagory")[1].innerHTML="Country : "+json['country'];
            document.querySelectorAll(".catagory")[2].innerHTML="City : "+json['city'];
            if(json['isfavored']==1){
                document.querySelectorAll(".button")[0].setAttribute("onclick","favor(0,'"+path+"')");
                document.querySelectorAll(".button span")[0].innerHTML="Unfavor";
                document.querySelectorAll(".button")[0].setAttribute("style","background-color:red");
            }
            else{
                document.querySelectorAll(".button")[0].setAttribute("onclick","favor(1,'"+path+"')");
                document.querySelectorAll(".button span")[0].innerHTML="Favor";
                document.querySelectorAll(".button")[0].setAttribute("style","background-color:green");
            }
        }
    });
}
$(document).ready(function(){
    var query = window.location.search.substring(1);
    if(query=="")window.location.href="./login.html";
    path=query.split("=")[1];
    updatepic(path);
});