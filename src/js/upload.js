var type;
var contents=Array();
var cities=Array();
var countries=Array();
function getfilters(){
    $.ajax({
        type: "POST",
        url: "./php/ajax.php?action=getfilters",
        dataType: "json",
        success: function (json) {
            $(".country option").remove();
            for(var i=0;i<json['countrynamecount'];i++){
                countries.push(json['countryname'][i]);
                var citytemp=new Array();
                for(var j=0;j<json['countrycity'][i].length;j++){
                    citytemp.push(json['countrycity'][i][j]);
                }
                cities[i]=citytemp;
            }
            for(var i=0;i<json['countrynamecount'];i++){
                $(".country").append("<option value='"+i+"'>"+countries[i]+"</option>");
            }
            for(var i=0;i<cities[0].length;i++){
                $(".city").append("<option value='"+i+"'>"+cities[0][i]+"</option>");
            }
        }
    });
}
$(document).ready(function(){
    $(".country").on("change",function(){
        var op=$(".country").val();
        $(".city option").remove();
        if(op>=0){
            for(var i=0;i<cities[op].length;i++){
                $(".city").append("<option value='"+i+"'>"+cities[op][i]+"</option>");
            }
        }    
    });
    getfilters();
    $(".file").on("change",function(e){
        var fileread = new FileReader();
        var filename = $(this).get(0).files[0];
        var filetype = /jpeg|png|gif|bmp/ig;
        var ext = filename.type.split("/")[1];
        var name=e.currentTarget.files[0].name
        if(filetype.test(ext)){
            $(".button span:nth-child(2)").text("Reupload");
            $(".uploadimg").attr("src","");
            fileread.readAsDataURL(filename);
            fileread.onload=function(){
                $(".path").text(name);
                $(".uploadimg").attr("src",this.result);
            }
        }
        else{
            alert("图片格式不正确，请重新上传！");
        }
    });
    contents=Array("Scenery","City","People","Animal","Building","Wonder","Other");
    for(var i=0;i<contents.length;i++){
        if(i==0)$(".content").append("<option value='"+i+"' selected>"+contents[i]+"</option>");
        else $(".content").append("<option value='"+i+"'>"+contents[i]+"</option>");
    }
    var query = window.location.search.substring(1);
    if(query=="")type=1;//upload
    else {
        type=0;//modify
        document.querySelectorAll(".button span")[0].innerHTML="Modify";
        document.querySelectorAll(".button span")[1].innerHTML="Confirm";
        path=query.split("=")[1];
        $(".path").html(path);
        $(".uploadimg").attr("src","../img/normal/medium/"+path);
        $.ajax({
            type: "POST",
            url:"./php/ajax.php?action=getmodifyinfo",
            data:{
                "path":path
            },
            dataType: 'json',
            success: function (json) {
                $(".titles").val(json['title']);
                $(".descinput").val(json['desc']);
                $(".country option").remove();
                for(var i=0;i<countries.length;i++){
                    if(countries[i]==json['country']){
                        $(".city option").remove();
                        for(var j=0;j<cities[i].length;j++){
                            if(cities[i][j]==json['city'])$(".city").append("<option value='"+j+"' selected>"+cities[i][j]+"</option>");
                            $(".city").append("<option value='"+j+"'>"+cities[i][j]+"</option>");
                        }
                        $(".country").append("<option value='"+i+"' selected>"+countries[i]+"</option>");
                    }
                    else $(".country").append("<option value='"+i+"'>"+countries[i]+"</option>");
                }
                $(".content option").remove();
                for(var i=0;i<contents.length;i++){
                    if(contents[i]==json['content'])$(".content").append("<option value='"+i+"' selected>"+contents[i]+"</option>");
                    else $(".content").append("<option value='"+i+"'>"+contents[i]+"</option>");
                }
            }
        });
    }
    $(".button:last-child").on("click",function(){
        if(type==1){
            if($(".button span:nth-child(2)").text()!="Reupload"){
                $(".msg").html("No image uploaded");
                $(".msg").css("display", "block");
                $(".msg").css("color", "red");
                return;
            }
            $.ajaxFileUpload({
                url:"./php/ajax.php?action=upload",
                secureuri: false,
                fileElementId: "file",
                data:{
                    "title":$(".titles").val(),
                    "desc":$(".descinput").val(),
                    "country":countries[$(".country").val()],
                    "city":city[$(".city").val()],
                    "content":contents[$(".content").val()]
                },
                dataType: 'json',
                success: function (json) {
                    if(json.status==1){
                        $(".msg").html("Upload success! Jump in 1 second");
                        $(".msg").css("display", "block");
                        $(".msg").css("color", "green");
                        setTimeout(function(){
                            window.location.href = "./myphoto.html";
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
        else{
            if($(".button span:nth-child(2)").text()!="Reupload"){
                $.ajax({
                    type:"POST",
                    url:"./php/ajax.php?action=modifynoimg",
                    data:{
                        "title":$(".titles").val(),
                        "desc":$(".descinput").val(),
                        "country":countries[$(".country").val()],
                        "city":city[$(".city").val()],
                        "content":contents[$(".content").val()],
                        "path":path
                    },
                    dataType: 'json',
                    success: function (json) {
                        if(json.status==1){
                            $(".msg").html("Modify success! Jump in 1 second");
                            $(".msg").css("display", "block");
                            $(".msg").css("color", "green");
                            setTimeout(function(){
                                window.location.href = "./myphoto.html";
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
            else{
                $.ajaxFileUpload({
                    url:"./php/ajax.php?action=modifyhasimg",
                    secureuri: false,
                    fileElementId: "file",
                    data:{
                        "title":$(".titles").val(),
                        "desc":$(".descinput").val(),
                        "country":countries[$(".country").val()],
                        "city":city[$(".city").val()],
                        "content":contents[$(".content").val()],
                        "path":path
                    },
                    dataType: 'json',
                    success: function (json) {
                        if(json.status==1){
                            $(".msg").html("Upload success! Jump in 1 second");
                            $(".msg").css("display", "block");
                            $(".msg").css("color", "green");
                            setTimeout(function(){
                                window.location.href = "./myphoto.html";
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
        }
    });
});