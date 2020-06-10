var alt=1;
function swt(direction){
    if(alt==1&&!direction)alt=5;
    if(alt==4&&direction)alt=0;
    if(direction==0)alt--;
    else alt++;
    document.querySelectorAll(".headimg")[0].setAttribute("style","margin-left: -"+(alt*100-100)+"%;");
}
$(document).ready(function(){
    document.getElementsByClassName("arrow arrow_left")[0].setAttribute("onclick","swt(0)");
    document.getElementsByClassName("arrow arrow_right")[0].setAttribute("onclick","swt(1)");
    $.ajax({
        type: "POST",
        url: "./src/php/ajax.php?action=top10",
        data:{
            type:0
        },
        dataType: "json",
        success: function (json) {
            
            var bigimg=document.querySelectorAll(".imgs img");
            var imga=document.querySelectorAll(".imgs");
            var showimg=document.querySelectorAll(".picshow a img");
            var showimga=document.querySelectorAll(".picshow a");
            var titles=document.querySelectorAll(".pictitle");
            var descs=document.querySelectorAll(".picdesc");
            for(var i=0;i<4;i++){
                imga[i].setAttribute("href","./src/details.html?path="+json['path'][i]);
                bigimg[i].setAttribute("src","./img/normal/medium/"+json['path'][i]);
            }
            for(var i=4;i<10;i++){
                showimga[i-4].setAttribute("href","./src/details.html?path="+json['path'][i]);
                showimg[i-4].setAttribute("src","./img/normal/small/"+json['path'][i]);
                titles[i-4].innerHTML=json['title'][i];
                descs[i-4].innerHTML=json['desc'][i];
            }
        }
    });
    $(".reload").on("click",function(){
        $.ajax({
            type: "POST",
            url: "./src/php/ajax.php?action=top10",
            data:{
                type:1
            },
            dataType: "json",
            success: function (json) {
                
                var bigimg=document.querySelectorAll(".imgs img");
                var imga=document.querySelectorAll(".imgs");
                var showimg=document.querySelectorAll(".picshow a img");
                var showimga=document.querySelectorAll(".picshow a");
                var titles=document.querySelectorAll(".pictitle");
                var descs=document.querySelectorAll(".picdesc");
                for(var i=0;i<4;i++){
                    imga[i].setAttribute("href","./src/details.html?path="+json['path'][i]);
                    bigimg[i].setAttribute("src","./img/normal/medium/"+json['path'][i]);
                }
                for(var i=4;i<10;i++){
                    showimga[i-4].setAttribute("href","./src/details.html?path="+json['path'][i]);
                    showimg[i-4].setAttribute("src","./img/normal/small/"+json['path'][i]);
                    titles[i-4].innerHTML=json['title'][i];
                    descs[i-4].innerHTML=json['desc'][i];
                }
            }
        });
    })
});