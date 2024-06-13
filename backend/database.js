const {Client}=require("pg");
const client=new Client({
    host: 'localhost',
    por:5432,
    user:"postgres",
    password:"suhail",
    database:"Employees"
});

client.connect();
client.on("connect",()=>
{
    console.log("connected");
})

module.exports = client;
