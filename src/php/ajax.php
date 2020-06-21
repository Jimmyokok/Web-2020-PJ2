<?php
    error_reporting(E_ALL^E_NOTICE);
    session_start();
    $action=$_GET['action'];
///////////////////////////////////////////////////////////////////
    if ($action == "login"){
        $arr['username']=null;
        $username = stripslashes(trim($_POST['username']));  
        $password = stripslashes(trim($_POST['password']));  
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result = $mysqli->query("SELECT pass,username,uid FROM traveluser WHERE username='$username' OR email='$username';");
            if (mysqli_num_rows($result)>0) {
                $row = mysqli_fetch_assoc($result);
                $result->close();
                $result1 = $mysqli->query("SELECT salt FROM traveluser WHERE username='$username' OR email='$username';");
                $salt = mysqli_fetch_assoc($result1);
                if($salt['salt']!=NULL){
                    $hashed_password=hash("sha256",$password.$salt['salt']);
                }
                else{
                    $hashed_password=$password;
                }
                $result1->close();
                if($row['pass']==$hashed_password){
                    $_SESSION['user'] =$row['username'];
                    $_SESSION['uid'] =$row['uid'];
                    $arr['status']=1;
                    $arr['msg']="Login success!";
                    date_default_timezone_set("PRC");
		            $time=date("Y-m-d H:i:s", time());
                    $sql="UPDATE traveluser SET DateLastModified = '$time' WHERE username='$username' OR email='$username';";
                    mysqli_query($mysqli,$sql);
                }else{
                    $arr['status']=0;
                    $arr['msg']="Wrong password!";
                }
            }else{
                $result->close();
                $arr['status']=0;
                $arr['msg']="No such user!";
            }
        }
        $mysqli->close();
        echo json_encode($arr);
///////////////////////////////////////////////////////////////////
    }elseif($action == "register"){
        $arr['username']=null;
        $arr['uid']=null;
        $username = stripslashes(trim($_POST['username']));  
        $email = stripslashes(trim($_POST['email']));  
        $password = stripslashes(trim($_POST['password']));  
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result = $mysqli->query("SELECT pass FROM traveluser WHERE username='$username';");
            if (mysqli_num_rows($result)>0) {
                $arr['status']=0;
                $arr['msg']="Such user already exists!";
            }else{
                $result = $mysqli->query("SELECT pass FROM traveluser WHERE email='$email';");
                if (mysqli_num_rows($result)>0) {
                    $arr['status']=0;
                    $arr['msg']="Such E-mail already exists!";
                }else{
                    $row = mysqli_fetch_assoc($result);
                    $result->close();
                    $salt=base64_encode(random_bytes(32));
                    $register_password=hash("sha256",$password.$salt);
                    $arr['status']=1;
                    $arr['msg']="Register success!";
                    date_default_timezone_set("PRC");
                    $time=date("Y-m-d H:i:s", time());
                    $sql="INSERT INTO traveluser (email,username,pass,state,datejoined,datelastmodified,salt)
                                                        VALUES 
                                                    ('$email','$username','$register_password',1,'$time','$time','$salt');";
                    mysqli_query($mysqli,$sql);
                }       
            }
        }
        $mysqli->close();
        echo json_encode($arr);
///////////////////////////////////////////////////////////////////
    }elseif($action == "test"){
        $arr['username']=$_SESSION['user'];
        $arr['uid']=$_SESSION['uid'];
        $arr['status']=0;
        $arr['msg']="";
        echo json_encode($arr);
///////////////////////////////////////////////////////////////////
    }elseif($action == "logout"){
        $arr['username']=null;
        $arr['uid']=null;
        $arr['status']=0;
        $arr['msg']="";
        session_unset();
        session_destroy();
        echo json_encode($arr);
///////////////////////////////////////////////////////////////////
    }elseif($action == "top10"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $type = stripslashes(trim($_POST['type']));  
            if($type==0)$result = $mysqli->query("SELECT path,title,description 
                                        FROM travelimage LEFT JOIN travelimagefavor 
                                        ON travelimage.imageid=travelimagefavor.imageid 
                                        WHERE path is not null
                                        GROUP BY travelimage.imageid 
                                        ORDER BY count(favorid) desc limit 0,10;");
            else $result=$mysqli->query("SELECT path,title,description,RAND() as r FROM travelimage WHERE path is not null ORDER BY r LIMIT 0,10;");
            $paths=array();
            $titles=array();
            $descs=array();
            while($row = mysqli_fetch_assoc($result)){
                if($row['title']==null){
                    array_push($titles,"No title");
                }
                else{
                    array_push($titles,$row['title']);
                }
                if($row['description']==null){
                    array_push($descs,"No description");
                }
                else{
                    array_push($descs,$row['description']);
                }
                array_push($paths,$row['path']);
            }
            $result->close();
            $imagedata['path']=$paths;
            $imagedata['title']=$titles;
            $imagedata['desc']=$descs;
        }
        $mysqli->close();
        echo json_encode($imagedata);
    }
///////////////////////////////////////////////////////////////////
    elseif($action == "getcontents"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result=$mysqli->query("SELECT content FROM travelimage GROUP BY content;");
            $contents=array();
            while($row = mysqli_fetch_assoc($result)){
                if($row['content']!=null){
                    array_push($contents,$row['content']);
                }
            }
            $result->close();
            $contentdata['content']=$contents;
        }
        $mysqli->close();
        echo json_encode($contentdata);
    }
///////////////////////////////////////////////////////////////////
    elseif($action == "top5city"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result = $mysqli->query("SELECT asciiname 
                                        FROM (select citycode 
                                                FROM (SELECT travelimage.imageid,citycode 
                                                        FROM travelimage LEFT JOIN travelimagefavor 
                                                        ON travelimage.imageid=travelimagefavor.imageid 
                                                        GROUP BY travelimage.imageid 
                                                        ORDER BY count(favorid) desc) AS x 
                                                GROUP BY citycode 
                                                ORDER BY count(x.imageid) desc) as y,geocities 
                                        WHERE y.citycode=geonameid limit 0,5;");
            $names=array();
            $num=mysqli_num_rows($result);
            while($row = mysqli_fetch_assoc($result)){
                if($row['asciiname']==null){
                   $num--;
                }
                else{
                    array_push($names,$row['asciiname']);
                }
            }
            $result->close();
            $citydata['count']=$num;
            $citydata['cityname']=$names;
        }
        $mysqli->close();
        echo json_encode($citydata);
///////////////////////////////////////////////////////////////////
    }elseif($action == "top5country"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result = $mysqli->query("SELECT countryname
                                        FROM (SELECT countrycodeiso,count(geonameid) AS count 
                                                FROM (select citycode 
                                                        FROM (SELECT travelimage.imageid,citycode  
                                                                FROM travelimage LEFT JOIN travelimagefavor 
                                                                ON travelimage.imageid=travelimagefavor.imageid 
                                                                GROUP BY travelimage.imageid) AS x 
                                                        GROUP BY citycode ) AS y,geocities 
                                                WHERE y.citycode=geonameid 
                                                GROUP BY countrycodeiso) AS z,geocountries 
                                        WHERE z.countrycodeiso=iso
                                        ORDER BY count desc limit 0,5;");
            $names=array();
            $num=mysqli_num_rows($result);
            while($row = mysqli_fetch_assoc($result)){
                if($row['countryname']==null){
                   $num--;
                }
                else{
                    array_push($names,$row['countryname']);
                }
            }
            $result->close();
            $countrydata['count']=$num;
            $countrydata['countryname']=$names;
        }
        $mysqli->close();
        echo json_encode($countrydata);
///////////////////////////////////////////////////////////////////
    }elseif($action == "top5content"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $result = $mysqli->query("SELECT content 
                                        FROM travelimage LEFT JOIN travelimagefavor 
                                        ON travelimage.imageid=travelimagefavor.imageid 
                                        GROUP BY content 
                                        ORDER BY count(favorid) desc limit 0,5;");
            $names=array();
            $num=mysqli_num_rows($result);
            while($row = mysqli_fetch_assoc($result)){
                if($row['content']==null){
                   $num--;
                }
                else{
                    array_push($names,$row['content']);
                }
            }
            $result->close();
            $contentdata['count']=$num;
            $contentdata['contentname']=$names;
        }
        $mysqli->close();
        echo json_encode($contentdata);
///////////////////////////////////////////////////////////////////
    }elseif($action == "getfilters"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $type = stripslashes(trim($_POST['type']));  
            $name = stripslashes(trim($_POST['name']));  
            $result = $mysqli->query("SELECT content 
                                        FROM travelimage LEFT JOIN travelimagefavor 
                                        ON travelimage.imageid=travelimagefavor.imageid 
                                        GROUP BY content 
                                        ORDER BY count(favorid) desc;");
            $contents=array();
            $contentcount=mysqli_num_rows($result);
            while($row = mysqli_fetch_assoc($result)){
                if($row['content']!=null){
                    array_push($contents,$row['content']);
                }
            }
            $result->close();
            if($type==0){
                $result = $mysqli->query("SELECT countryname,ISO
                                        FROM (SELECT countrycodeiso,count(geonameid) AS count 
                                                FROM (select citycode 
                                                        FROM (SELECT travelimage.imageid,citycode  
                                                                FROM travelimage LEFT JOIN travelimagefavor 
                                                                ON travelimage.imageid=travelimagefavor.imageid 
                                                                GROUP BY travelimage.imageid) AS x 
                                                        GROUP BY citycode ) AS y,geocities 
                                                WHERE y.citycode=geonameid 
                                                GROUP BY countrycodeiso) AS z,geocountries 
                                        WHERE z.countrycodeiso=iso
                                        ORDER BY count desc;");
            }else{
                $result = $mysqli->query("SELECT countryname,ISO FROM geocountries;");
            }
            $countries=array();
            $isos=array();
            $countrycity=array();
            $countrycount=mysqli_num_rows($result);
            while($row = mysqli_fetch_assoc($result)){
                if($row['countryname']!=null){
                    array_push($countries,$row['countryname']);
                    array_push($isos,$row['ISO']);
                }
            }
            $result->close();
            if($type==0){
                for($i=0;$i<count($countries);$i++){
                    $resultcity=$mysqli->query("SELECT DISTINCT z.asciiname 
                                                FROM(SELECT asciiname,CountryCodeISO 
                                                        FROM (select citycode 
                                                                FROM (SELECT travelimage.imageid,citycode 
                                                                        FROM travelimage LEFT JOIN travelimagefavor 
                                                                        ON travelimage.imageid=travelimagefavor.imageid 
                                                                        GROUP BY travelimage.imageid 
                                                                        ORDER BY count(favorid) desc) AS x 
                                                                GROUP BY citycode
                                                                ORDER BY count(x.imageid) desc) As y,geocities 
                                                        WHERE y.citycode=geonameid) AS z,geocountries 
                                                WHERE z.countrycodeiso='$isos[$i]' AND z.countrycodeiso=ISO;");
                    $cities=array();
                    while($row2 = mysqli_fetch_assoc($resultcity)){
                        if($row2['asciiname']!=null){
                            array_push($cities,$row2['asciiname']);
                        }
                    }
                    array_push($countrycity,$cities);
                    $resultcity->close();
                }
            }else if($type==2){
                $resultcity=$mysqli->query("SELECT DISTINCT asciiname FROM geocities,geocountries WHERE countrycodeiso=ISO AND countryname='$name' AND geocities.population>2000;");
                $countrycount=mysqli_num_rows($resultcity);
                while($row2 = mysqli_fetch_assoc($resultcity)){
                    if($row2['asciiname']!=null){
                        array_push($countrycity,$row2['asciiname']);
                    }
                }
            }
            $filterdata['content']=$contents;
            $filterdata['countryname']=$countries;
            $filterdata['contentcount']=$contentcount;
            $filterdata['countrynamecount']=$countrycount;
            $filterdata['countrycity']=$countrycity;
        }
        $mysqli->close();
        echo json_encode($filterdata);
///////////////////////////////////////////////////////////////////
    }elseif($action == "filter"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $type = stripslashes(trim($_POST['type']));  
            $contentname = stripslashes(trim($_POST['contentname'])); 
            $countryname = stripslashes(trim($_POST['countryname'])); 
            $cityname = stripslashes(trim($_POST['cityname']));
            if($type!=1){
                $bycontent=($type>>2)&1;
                $bycountry=($type>>1)&1;
                $bycity=$type&1;
                if($bycountry==1){
                    if($bycity==0){
                        $sql="SELECT path 
                                FROM (SELECT geocities.geonameid 
                                        FROM geocities,geocountries 
                                        WHERE countrycodeiso=iso AND countryname='$countryname') as x,travelimage 
                                WHERE x.geonameid=citycode";
                    }else{
                        $sql="SELECT path 
                                FROM (SELECT geonameid 
                                        FROM geocities 
                                        WHERE asciiname='$cityname') as x,travelimage 
                                WHERE x.geonameid=citycode";
                    }
                }else{
                    if($bycity==0){
                        $sql="SELECT path 
                                FROM travelimage 
                                WHERE 1";
                    }
                }
            }
            else{
                $sql="SELECT path FROM travelimage WHERE title LIKE '%$cityname%'";
            }
            if($bycontent==1){
                $sql=$sql." AND content='$contentname';";
            }else{
                $sql=$sql.";";
            }
            $result=$mysqli->query($sql);
            $count=mysqli_num_rows($result);
            $paths=array();
            while($row = mysqli_fetch_assoc($result)){
                if($row['path']!=null){
                    array_push($paths,$row['path']);
                }
                else{
                    $count--;
                }
            }
            $imgpaths=array();
            for($j=0;$j<($count-1)/24+1;$j++){
                $pathpage=array();
                for($k=0;$k<24&&$k+$j*24<$count;$k++){
                    array_push($pathpage,$paths[$k+$j*24]);
                }
                array_push($imgpaths,$pathpage);
            }
            $result->close();
            $filterpaths['count']=$count;
            $filterpaths['paths']=$imgpaths;     
        }
        $mysqli->close();
        echo json_encode($filterpaths);
///////////////////////////////////////////////////////////////////
    }elseif($action == "search"){
        $mysqli=new mysqli("localhost","root","","travel",3306);
        if ($mysqli->connect_errno) {
            $arr['status']=0;
            $arr['msg']="Unable to access database!";
        }else{
            $type = stripslashes(trim($_POST['type']));  
            $string = stripslashes(trim($_POST['string'])); 
            if($type==1){
                $sql="SELECT path,title,description FROM travelimage WHERE description LIKE '%$string%';";
            }
            else{
                $sql="SELECT path,title,description FROM travelimage WHERE title LIKE '%$string%';";
            }
            $result=$mysqli->query($sql);
            $count=mysqli_num_rows($result);
            $paths=array();
            $titles=array();
            $descs=array();
            while($row = mysqli_fetch_assoc($result)){
                if($row['path']!=null){
                    array_push($paths,$row['path']);
                    array_push($titles,$row['title']==NULL?"No title":$row['title']);
                    array_push($descs,$row['description']==NULL?"No description":$row['description']);
                }
                else{
                    $count--;
                }
            }
            $result->close();
            $imgpaths=array();
            for($j=0;$j<($count-1)/4+1;$j++){
                $pathpage=array();
                for($k=0;$k<4&&$k+$j*4<$count;$k++){
                    array_push($pathpage,array($paths[$k+$j*4],$titles[$k+$j*4],$descs[$k+$j*4]));
                }
                array_push($imgpaths,$pathpage);
            }
            $searchpaths['count']=$count;
            $searchpaths['paths']=$imgpaths;
        }
        $mysqli->close();
        echo json_encode($searchpaths);
///////////////////////////////////////////////////////////////////
}elseif($action == "myphoto"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $type = stripslashes(trim($_POST['type']));  
        if($type==1){
            $sql="SELECT path,title,description FROM travelimage WHERE uid='".$_SESSION['uid']."';";
        }else {
            $sql="SELECT path,title,description FROM travelimagefavor,travelimage 
                                                WHERE travelimagefavor.uid='".$_SESSION['uid']."' 
                                                AND travelimagefavor.imageid=travelimage.imageid;";
        }
        $result=$mysqli->query($sql);
        $count=mysqli_num_rows($result);
        $paths=array();
        $titles=array();
        $descs=array();
        while($row = mysqli_fetch_assoc($result)){
            if($row['path']!=null){
                array_push($paths,$row['path']);
                array_push($titles,$row['title']==NULL?"No title":$row['title']);
                array_push($descs,$row['description']==NULL?"No description":$row['description']);
            }
            else{
                $count--;
            }
        }
        $result->close();
        $imgpaths=array();
        for($j=0;$j<($count-1)/4+1;$j++){
            $pathpage=array();
            for($k=0;$k<4&&$k+$j*4<$count;$k++){
                array_push($pathpage,array($paths[$k+$j*4],$titles[$k+$j*4],$descs[$k+$j*4]));
            }
            array_push($imgpaths,$pathpage);
        }
        $myphotopaths['count']=$count;
        $myphotopaths['paths']=$imgpaths;
    }
    $mysqli->close();
    echo json_encode($myphotopaths);
///////////////////////////////////////////////////////////////////
}elseif($action == "getdetails"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $path = stripslashes(trim($_POST['path']));  
        $sqlForImgInfo="SELECT imageid,title,description,citycode,uid,content FROM travelimage WHERE path='$path';";
        $result=$mysqli->query($sqlForImgInfo);
        $row=mysqli_fetch_assoc($result);
        $imageid=$row['imageid'];
        $citycode=$row['citycode'];
        $uid=$row['uid'];
        $detailinfos['title']=$row['title']==NULL?"No title":$row['title'];
        $detailinfos['desc']=$row['description']==NULL?"No description":$row['description'];
        $detailinfos['content']=$row['content'];
        $result->close();

        $sqlForUserInfo="SELECT username FROM traveluser WHERE uid='$uid';";
        $sqlForCityInfo="SELECT asciiname,countrycodeiso FROM geocities WHERE geonameid='$citycode';";
        $sqlForFavorInfo="SELECT COUNT(favorid) as count FROM travelimagefavor WHERE imageid='$imageid';";

        $result=$mysqli->query($sqlForUserInfo);
        $row=mysqli_fetch_assoc($result);
        $detailinfos['username']=$row['username'];
        $result->close();

        $result=$mysqli->query($sqlForCityInfo);
        $row=mysqli_fetch_assoc($result);
        $detailinfos['city']=$row['asciiname'];
        $iso=$row['countrycodeiso'];
        $result->close();

        $result=$mysqli->query($sqlForFavorInfo);
        $row=mysqli_fetch_assoc($result);
        $detailinfos['likenumber']=$row['count'];
        $result->close();

        $sqlForCountryInfo="SELECT countryname FROM geocountries WHERE iso='$iso';";
        $sqlForIsFavored="SELECT uid FROM travelimagefavor WHERE imageid='$imageid' AND uid='".$_SESSION['uid']."';";

        $result=$mysqli->query($sqlForCountryInfo);
        $row=mysqli_fetch_assoc($result);
        $detailinfos['country']=$row['countryname'];
        $result->close();

        $result=$mysqli->query($sqlForIsFavored);
        if(mysqli_num_rows($result)>0)$detailinfos['isfavored']=1;
        else $detailinfos['isfavored']=0;
    }
    $mysqli->close();
    echo json_encode($detailinfos);
///////////////////////////////////////////////////////////////////
}elseif($action == "favor"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $type = stripslashes(trim($_POST['type']));  
        $path = stripslashes(trim($_POST['path']));  
        $sqlForImgInfo="SELECT imageid FROM travelimage WHERE path='$path';";
        $result=$mysqli->query($sqlForImgInfo);
        $row=mysqli_fetch_assoc($result);
        $imageid=$row['imageid'];
        $result->close();

        $uid=$_SESSION['uid'];
        if($type==1)$sqlForFavor="INSERT INTO travelimagefavor (uid,imageid) VALUES ('$uid','$imageid');";
        else $sqlForFavor="DELETE FROM travelimagefavor WHERE uid='$uid' AND imageid='$imageid';";
        mysqli_query($mysqli,$sqlForFavor);
    }
    $mysqli->close();
    $arr['path']=$path;
    echo json_encode($arr);
///////////////////////////////////////////////////////////////////
}elseif($action == "upload"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $title = stripslashes(trim($_POST['title']));  
        $desc = stripslashes(trim($_POST['desc']));  
        $country = stripslashes(trim($_POST['country']));  
        $city = stripslashes(trim($_POST['city']));  
        $content = stripslashes(trim($_POST['content']));  
        if($title==""){
            $arr['status']=0;
            $arr['msg']="Empty title!";
        }elseif($content==""){
            $arr['status']=0;
            $arr['msg']="Empty content!";
        }else{
            if($desc=="")$desc="No description";
            $sqlForCountryInfo="SELECT iso FROM geocountries WHERE countryname='$country';";
            $result=$mysqli->query($sqlForCountryInfo);
            if(mysqli_num_rows($result)==0){
                $arr['status']=0;
                $arr['msg']="No such country!";
                $result->close();
            }else{
                $row=mysqli_fetch_assoc($result);
                $iso=$row['iso'];
                $result->close();
                $sqlForCityInfo="SELECT geonameid,latitude,longitude FROM geocities WHERE asciiname='$city' AND countrycodeiso='$iso';";
                $result=$mysqli->query($sqlForCityInfo);
                if(mysqli_num_rows($result)==0){
                    $arr['status']=0;
                    $arr['msg']="No such city!";
                    $result->close();
                }else{
                    $row=mysqli_fetch_assoc($result);
                    $citycode=$row['geonameid'];
                    $la=$row['latitude'];
                    $lo=$row['longitude'];
                    $arr['status']=1;
                    $result->close();
                    date_default_timezone_set("PRC");
                    $time=date("YmdHis", time());
                    $tmp_filename = $_FILES['file']['tmp_name'];
                    move_uploaded_file($tmp_filename,"C:/Web/img/normal/medium/$time.jpg");
                    copy("C:/Web/img/normal/medium/$time.jpg","C:/Web/img/normal/small/$time.jpg");
                    copy("C:/Web/img/normal/medium/$time.jpg","C:/Web/img/normal/tiny/$time.jpg");
                    $sql="INSERT INTO travelimage (title,description,latitude,longitude,citycode,countrycodeiso,uid,path,content)
                                                    VALUES
                                                    ('$title','$desc','$la','$lo','$citycode','$iso','".$_SESSION['uid']."','$time.jpg','$content');";
                    mysqli_query($mysqli,$sql);
                }
            }
        }    
    }
    $mysqli->close();
    echo json_encode($arr);
///////////////////////////////////////////////////////////////////
}elseif($action == "getmodifyinfo"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $path = stripslashes(trim($_POST['path']));  
        $sql="SELECT title,description,citycode,content FROM travelimage WHERE path='".$path."';";
        $result=$mysqli->query($sql);
        $row=mysqli_fetch_assoc($result);
        $modifyinfos['title']=$row['title'];
        $modifyinfos['desc']=$row['description'];
        $modifyinfos['content']=$row['content'];
        $citycode=$row['citycode'];
        $result->close();

        $sql="SELECT asciiname,countrycodeiso FROM geocities WHERE geonameid='$citycode';";
        $result=$mysqli->query($sql);
        $row=mysqli_fetch_assoc($result);
        $modifyinfos['city']=$row['asciiname'];
        $iso=$row['countrycodeiso'];
        $result->close();

        $sql="SELECT countryname FROM geocountries WHERE iso='$iso';";
        $result=$mysqli->query($sql);
        $row=mysqli_fetch_assoc($result);
        $modifyinfos['country']=$row['countryname'];
        $result->close();
    }
    $mysqli->close();
    echo json_encode($modifyinfos);
///////////////////////////////////////////////////////////////////
}elseif($action == "modifyhasimg"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $title = stripslashes(trim($_POST['title']));  
        $desc = stripslashes(trim($_POST['desc']));  
        $country = stripslashes(trim($_POST['country']));  
        $city = stripslashes(trim($_POST['city']));  
        $content = stripslashes(trim($_POST['content']));  
        $path = stripslashes(trim($_POST['path']));  
        if($title==""){
            $arr['status']=0;
            $arr['msg']="Empty title!";
        }elseif($content==""){
            $arr['status']=0;
            $arr['msg']="Empty content!";
        }else{
            if($desc=="")$desc="No description";
            $sqlForCountryInfo="SELECT iso FROM geocountries WHERE countryname='$country';";
            $result=$mysqli->query($sqlForCountryInfo);
            if(mysqli_num_rows($result)==0){
                $arr['status']=0;
                $arr['msg']="No such country!";
                $result->close();
            }else{
                $row=mysqli_fetch_assoc($result);
                $iso=$row['iso'];
                $result->close();
                $sqlForCityInfo="SELECT geonameid,latitude,longitude FROM geocities WHERE asciiname='$city' AND countrycodeiso='$iso';";
                $result=$mysqli->query($sqlForCityInfo);
                if(mysqli_num_rows($result)==0){
                    $arr['status']=0;
                    $arr['msg']="No such city!";
                    $result->close();
                }else{
                    $row=mysqli_fetch_assoc($result);
                    $citycode=$row['geonameid'];
                    $la=$row['latitude'];
                    $lo=$row['longitude'];
                    $arr['status']=1;
                    $result->close();
                    date_default_timezone_set("PRC");
                    $time=date("YmdHis", time());
                    $tmp_filename = $_FILES['file']['tmp_name'];
                    unlink("C:/Web/img/normal/small/$path");
                    unlink("C:/Web/img/normal/medium/$path");
                    unlink("C:/Web/img/normal/tiny/$path");
                    move_uploaded_file($tmp_filename,"C:/Web/img/normal/medium/$path");
                    copy("C:/Web/img/normal/medium/$path","C:/Web/img/normal/small/$path");
                    copy("C:/Web/img/normal/medium/$path","C:/Web/img/normal/tiny/$path");
                    $sql="UPDATE travelimage 
                            SET
                                title='$title',
                                description='$desc',
                                latitude='$la',
                                longitude='$lo',
                                citycode='$citycode',
                                countrycodeiso='$iso',
                                content='$content'
                            WHERE path='$path';";
                    mysqli_query($mysqli,$sql); 
                }
            }
        }    
    }
    $mysqli->close();
    echo json_encode($arr);
///////////////////////////////////////////////////////////////////
}elseif($action == "modifynoimg"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{
        $title = stripslashes(trim($_POST['title']));  
        $desc = stripslashes(trim($_POST['desc']));  
        $country = stripslashes(trim($_POST['country']));  
        $city = stripslashes(trim($_POST['city']));  
        $content = stripslashes(trim($_POST['content']));  
        $path = stripslashes(trim($_POST['path']));  
        if($title==""){
            $arr['status']=0;
            $arr['msg']="Empty title!";
        }elseif($content==""){
            $arr['status']=0;
            $arr['msg']="Empty content!";
        }else{
            if($desc=="")$desc="No description";
            $sqlForCountryInfo="SELECT iso FROM geocountries WHERE countryname='$country';";
            $result=$mysqli->query($sqlForCountryInfo);
            if(mysqli_num_rows($result)==0){
                $arr['status']=0;
                $arr['msg']="No such country!";
                $result->close();
            }else{
                $row=mysqli_fetch_assoc($result);
                $iso=$row['iso'];
                $result->close();
                $sqlForCityInfo="SELECT geonameid,latitude,longitude FROM geocities WHERE asciiname='$city' AND countrycodeiso='$iso';";
                $result=$mysqli->query($sqlForCityInfo);
                if(mysqli_num_rows($result)==0){
                    $arr['status']=0;
                    $arr['msg']="No such city!";
                    $result->close();
                }else{
                    $row=mysqli_fetch_assoc($result);
                    $citycode=$row['geonameid'];
                    $la=$row['latitude'];
                    $lo=$row['longitude'];
                    $arr['status']=1;
                    $result->close();
                    $sql="UPDATE travelimage 
                            SET
                                title='$title',
                                description='$desc',
                                latitude='$la',
                                longitude='$lo',
                                citycode='$citycode',
                                countrycodeiso='$iso',
                                content='$content'
                            WHERE path='$path';";
                    mysqli_query($mysqli,$sql);
                }
            }
        }    
    }
    $mysqli->close();
    echo json_encode($arr);
///////////////////////////////////////////////////////////////////
}elseif($action == "delete"){
    $mysqli=new mysqli("localhost","root","","travel",3306);
    if ($mysqli->connect_errno) {
        $arr['status']=0;
        $arr['msg']="Unable to access database!";
    }else{ 
        $path = stripslashes(trim($_POST['path']));  
        $sql="DELETE FROM travelimage WHERE path='$path';";
        mysqli_query($mysqli,$sql); 
    }
    $mysqli->close();
    echo json_encode($arr);
}
?>

