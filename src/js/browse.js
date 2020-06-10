var cities=Array();
var num=0;
var sum=5;
var shiftindex=0;
var pagesum=5;
var pageimgcount=24;
var imgpages=Array();
function jump(i){
    imgcount=imgpages[i].length;
    resetpages();
    for(var j=0;j<imgcount;j++){
        var img=document.createElement("a");
        img.href="./details.html?path="+imgpages[i][j];
        img.className="picshow";
        img.innerHTML="<img src='../img/normal/small/"+imgpages[i][j]+"'>";
        img.setAttribute("style","cursor:pointer");
        document.querySelectorAll(".imgpage")[0].appendChild(img);        
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
    var total=document.querySelectorAll(".imgpage")[0].children.length;
    var total1=parseInt((total-1)/4+1);
    var total2=parseInt((total-1)/3+1);
    var total3=parseInt((total-1)/2+1);
    if(document.getElementById('newstyle')!=null)document.getElementById('newstyle').remove();
    var style=document.createElement('style');
    style.innerHTML=".container{ height:"+(17*total1+6)+"vw;}";
    style.innerHTML+="@media only screen and (max-width:1000px){.container{height: "+(23*total2+8)+"vw;}}";
    style.innerHTML+="@media only screen and (max-width:750px){.container{height: "+(34*total3+8)+"vw;}}";
    style.innerHTML+="@media only screen and (max-width:600px){.container{height: calc("+(96.5*total+8)+"vw);}}";
    style.id="newstyle";
    window.document.head.appendChild(style);
}
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
    }
    else{
        document.querySelectorAll(".page")[0].innerHTML="";
    }
    jump(0);
}
function getfilters(){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=getfilters",
        dataType: "json",
        success: function (json) {
            $(".content option").remove();
            $(".country option").remove();
            $(".content").append("<option value='-2' disabled selected hidden>Filter by content</option>");
            $(".country").append("<option value='-2' disabled selected hidden>Filter by country</option>");
            for(var i=0;i<json['contentcount'];i++){
                $(".content").append("<option value='"+i+"'>"+json['content'][i]+"</option>");
            }
            for(var i=0;i<json['countrynamecount'];i++){
                $(".country").append("<option value='"+i+"'>"+json['countryname'][i]+"</option>");
                var citytemp=new Array();
                for(var j=0;j<json['countrycity'][i].length;j++){
                    citytemp.push(json['countrycity'][i][j]);
                }
                cities[i]=citytemp;
            }
            $(".content").append("<option value='-1'>None</option>");
            $(".country").append("<option value='-1'>None</option>");
        }
    });
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=top5city",
        dataType: "json",
        success: function (json) {
            var hotcities=document.querySelectorAll(".hotcity");
            hotcities[0].innerHTML="<p>Hot City</p>";
            for(var i=0;i<json['count'];i++){
                hotcities[0].innerHTML+="<a style='cursor:pointer' onclick=\"filterbyaside(3,'','','"+json['cityname'][i]+"')\">"+json['cityname'][i]+"</a>";
            }
            var style = document.createElement('style');
            style.innerHTML = ".hotcity:nth-child(3){height:calc("+3*(json['count']+1)+"em + 5px);}@media only screen and ( max-width:1000px){.hotcity:nth-child(3){height:calc("+2*(json['count']+1)+"em + 5px);}}";
            window.document.head.appendChild(style);

        }
    });
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=top5country",
        dataType: "json",
        success: function (json) {
            var hotcities=document.querySelectorAll(".hotcity");
            hotcities[1].innerHTML="<p>Hot Country</p>";
            for(var i=0;i<json['count'];i++){
                hotcities[1].innerHTML+="<a  style='cursor:pointer' onclick=\"filterbyaside(2,'','"+json['countryname'][i]+"','')\">"+json['countryname'][i]+"</a>";
            }
            var style = document.createElement('style');
            style.innerHTML = ".hotcity:nth-child(4){height:calc("+3*(json['count']+1)+"em + 5px);}@media only screen and ( max-width:1000px){.hotcity:nth-child(4){height:calc("+2*(json['count']+1)+"em + 5px);}}";
            window.document.head.appendChild(style);
        }
    });
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=top5content",
        dataType: "json",
        success: function (json) {
            var hotcities=document.querySelectorAll(".hotcity");
            hotcities[2].innerHTML="<p>Hot Content</p>";
            for(var i=0;i<json['count'];i++){
                hotcities[2].innerHTML+="<a  style='cursor:pointer' onclick=\"filterbyaside(4,'"+json['contentname'][i]+"','','')\">"+json['contentname'][i]+"</a>";
            }
            var style = document.createElement('style');
            style.innerHTML = ".hotcity:nth-child(5){height:calc("+3*(json['count']+1)+"em + 5px);}@media only screen and ( max-width:1000px){.hotcity:nth-child(5){height:calc("+2*(json['count']+1)+"em + 5px);}}";
            window.document.head.appendChild(style);
        }
    });
}
function resetpages(){
    document.querySelectorAll(".imgpage")[0].innerHTML="";
}
function getimgs(type,contentname,countryname,cityname,display){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=filter",
        data:{
            "type":type,
            "contentname":contentname,
            "countryname":countryname,
            "cityname":cityname,
        },
        dataType: "json",
        success: function (json) {
            total=json['count'];
            if(display)$(".msg").css("display", "block");
            else $(".msg").css("display", "none");
            if(total!=0){
                $(".msg").html("Search complete! Found "+total+" results.");
                $(".msg").css("color", "green");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                },5000);
            }
            else{
                $(".msg").html("Not found!");
                $(".msg").css("color", "red");
                setTimeout(function(){
                    $(".msg").css("display", "none");
                },5000);
            }
            pagesum=parseInt((total-1)/pageimgcount+1);
            imgpages=json['paths'];
            resetpages();
            makearrows(pagesum);
        }
    });
}
function filterbyaside(type,contentname,countryname,cityname){
    $(".searchinput").val("");
    $(".content").val(-2);
    $(".country").val(-2);
    $(".city").val(-2);
    getimgs(type,contentname,countryname,cityname,0)
}
$(document).ready(function(){  
    getimgs(0,"","","",0);
    $(".country").on("change",function(){
        var op=$(".country").val();
        $(".city option").remove();
        $(".city").append("<option value='-2' disabled selected hidden>Filter by city</option>");
        if(op>=0){
            for(var i=0;i<cities[op].length;i++){
                $(".city").append("<option value='"+i+"'>"+cities[op][i]+"</option>");
            }
        }    
        $(".city").append("<option value='-1'>None</option>");
    });
    $(".button").on('click',null,function(){
        $(".searchinput").val("");
        var type=(($(".content").val()>=0&$(".content").val()!=null)<<2)|(($(".country").val()>=0&$(".country").val()!=null)<<1)|(($(".city").val()>=0&$(".city").val()!=null));
        getimgs(type,$(".content option:selected").text(),$(".country option:selected").text(),$(".city option:selected").text(),0);
    });
    $(".searchbutton").on('click',null,function(){
        $(".content").val(-2);
        $(".country").val(-2);
        $(".city").val(-2);
        getimgs(1,"","",$(".searchinput").val(),1);
    });
    getfilters();
});