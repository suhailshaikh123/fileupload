let s="user_name,user_email,age,height"
console.log(s);
for(var i=0; i<1000;i++){
    s=""
    let x = Math.floor((Math.random() * 100000) + 1);
    s=s+"suhail"+x+","
    x = Math.floor((Math.random() * 100000) + 1);
    s=s+"suhail"+x+"@gmail.com,";
    x = Math.floor((Math.random() * 100000) + 1);
    s=s+x+",";
    x = Math.floor((Math.random() * 100000) + 1);
    s=s+x;
    console.log(s);
}
