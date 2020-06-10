
var num=0;
var sum=8;
var shiftindex=0;
var pagesum=10;
var pageimgcount=4;
var imgpages=Array();
function jump(i){
    imgcount=imgpages[i].length;
    document.querySelectorAll(".resultpage")[0].innerHTML="";
    for(var j=0;j<imgcount;j++){
        var img=document.createElement("div");
        img.className="resultdiv";
        img.innerHTML="<a href='./details.html?path="+imgpages[i][j][0]+"'><img src='../img/normal/small/"+imgpages[i][j][0]+"'></a>";
        img.innerHTML+="<p class='title'>"+imgpages[i][j][1]+"</p>";
        img.innerHTML+="<p class='desc'>"+imgpages[i][j][2]+"</p>";
        document.querySelectorAll(".resultpage")[0].appendChild(img);        
    }
    if(pagesum>sum){
        if(i==pagesum-1){
            shiftindex=pagesum-sum;
            createarrows(sum,shiftindex);
        }
        else if(i>=sum-1+shiftindex&&sum+shiftindex<pagesum){
            shiftindex=i+2-sum;
            createarrows(sum,shiftindex);
        }
        else if(i<=shiftindex&&i>0){
            shiftindex=i-1;
            createarrows(sum,shiftindex);
        }
        else if(i==0){
            shiftindex=0;
            createarrows(sum,shiftindex);
        }
    }
    num=i;
    for(var j=0;j<sum&&j<pagesum;j++){
        var arr=document.querySelectorAll(".arrow")[j+1];
        if(j+shiftindex==i)arr.setAttribute("style","color:red;");
        else arr.setAttribute("style","color:blue;");
    }
    if(document.getElementById('newstyle')!=null)document.getElementById('newstyle').remove();
    var total=document.querySelectorAll(".resultpage")[0].children.length;
    var style=document.createElement('style');
    style.innerHTML=".container{ height:"+14*total+"em;}";
    style.innerHTML+=".imgcontent{ height:"+14*total+"em;}";
    style.innerHTML+="@media only screen and (max-width:600px){.container{height: calc("+75*total+"vw + "+250*total+"px);}.imgcontent{height: calc("+75*total+"vw + "+250*total+"px);}}";
    style.id="newstyle";
    window.document.head.appendChild(style);
};
function swt(direction){
    if(num==0&&!direction)num=pagesum;
    if(num==pagesum-1&&direction)num=-1;
    if(direction==0)num--;
    else num++;
    jump(num);
}
function createarrows(total,shiftindex){
    document.querySelectorAll(".page")[0].innerHTML="<a class='arrow'>&laquo</a>";
    for(var j=0;j<total;j++){
        document.querySelectorAll(".page")[0].innerHTML+="<a class='arrow'>"+(j+shiftindex+1)+"</a>";
    }
    document.querySelectorAll(".page")[0].innerHTML+="<a class='arrow'>&raquo</a>";
    document.querySelectorAll(".arrow")[0].setAttribute("onclick","swt(0)");
    for(var j=0;j<total;j++){
        var arr=document.querySelectorAll(".arrow")[j+1];
        arr.setAttribute("onclick","jump("+(j+shiftindex)+")");
    }
    document.querySelectorAll(".arrow")[total+1].setAttribute("onclick","swt(1)");       
}
function makearrows(total){
    pagesum=total;
    total=total>sum?sum:total;
    if(total>0){
        createarrows(total,0);
        document.querySelectorAll(".result")[0].setAttribute("style","display:block");
    }
    else{
        document.querySelectorAll(".page")[0].innerHTML="";
    }
    jump(0);
}
function resetpages(){
    document.querySelectorAll(".resultpage")[0].innerHTML="";
    document.querySelectorAll(".result")[0].setAttribute("style","display:none");
}
function getimgs(type,string){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=search",
        data:{
            "type":type,
            "string":string
        },
        dataType: "json",
        success: function (json) {
            total=json['count'];
            $(".msg").css("display", "block");
            $(".msgbox").css("display", "block");
            if(total!=0){
                $(".msg").html("Search complete! Found "+total+" results.");
                $(".msg").css("color", "green");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                    $(".msgbox").css("display", "none");
                },5000);
            }
            else{
                $(".msg").html("Not found!");
                $(".msg").css("color", "red");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                    $(".msgbox").css("display", "none");
                },5000);
            }
            pagesum=parseInt((total-1)/pageimgcount+1);
            imgpages=json['paths'];
            resetpages();
            makearrows(pagesum);
        }
    });
}
$(document).ready(function(){  
    resetpages();
    $(".button").on('click',null,function(){
        type=$("input[type='radio']:checked").val();
        var string;
        if(type==0){
            string=$(".textinput").val();
            $(".descinput").val("");
            if(string==""){
                $(".msg").css("display", "block");
                $(".msgbox").css("display", "block");
                $(".msg").html("Empty title!");
                $(".msg").css("color", "red");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                    $(".msgbox").css("display", "none");
                },5000);
                return;
            }
        }
        else{
            string=$(".descinput").val();
            $(".textinput").val("");
            if(string==""){
                $(".msg").css("display", "block");
                $(".msgbox").css("display", "block");
                $(".msg").html("Empty description!");
                $(".msg").css("color", "red");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                    $(".msgbox").css("display", "none");
                },5000);
                return;
            }
        }
        getimgs(type,string);
    });
});