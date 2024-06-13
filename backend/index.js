const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const bodyParser = require("body-parser");
var format = require("pg-format");

const app = express();

app.use(cors());
app.use(bodyParser.json());
const upload = require("./upload");
const client = require("./database");
const parsedData = [];
let values = [];
let flag = false;



app.post("/upload", upload.single("myfile"), (req, res) => {
  console.log("Uploaded file:", req.file);

  if (!req.file) {
    console.error("No file uploaded.");
    res.status(400).send("No file uploaded.");
    return;
  }

  const filePath = path.join(__dirname, req.file.path);

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      // console.log(row);
      if (
       row.name && row.email && row.age && row.address
      )  {
        // console.log("shaikh")
       
        parsedData.push(row);
        let temp = [];

        temp.push(row.name);
        temp.push(row.email);
        temp.push(row.age);
        temp.push(row.address);

        values.push(temp);
      }
    })
    .on("end", () => {
      console.log("parsing data complete");
      // console.log(values)
     
      
      console.log("data transfer complete");
      // console.log(parsedData)
      // let q = "INSERT INTO employee (user_name, user_email, age, address) VALUES ($1, $2, $3, $4) ON CONFLICT (user_email) DO UPDATE SET user_name = EXCLUDED.user_name, age = EXCLUDED.age, address = EXCLUDED.address;";


      // values.forEach(element => {
      //   // console.log(element)
      //   client.query(
      //    q,
      //     [element[0],element[1],element[2],element[3]],
      //     (err, result) => {
      //       if (err == null) {
      //         console.log(result.rowCount + " rows inserted successfully");
      //         values=[]
              
      //       } else {
      //         console.log(err);
      //       }
      //     }
      //   );
      // });
      // console.log(parsedData);
      client.query(
        format("INSERT INTO employee VALUES %L ON CONFLICT (user_email) DO NOTHING;", values),
        [],
        (err, result) => {
          if (err == null) {
            console.log(result.rowCount + " rows inserted successfully");
            res.send(parsedData.slice(0, 10));
            values=[]
            
          } else {
            console.log(err);
          }
        }
      );
      flag = true;
    });
});

app.post("/fetch", (req, res) => {
  if (flag == false) {
    return res.send({ msg: flag });
  }
  let sort=req.body.sort;
  let currentPage = req.body.currentPage;
  let search=req.body.search;
  console.log(search.length);

  let offset = (currentPage - 1) * 10;

  
  let limit = 10;
  
  let sel="SELECT * FROM employee";
  let query=sel;
  let constraint="LIMIT $1 OFFSET $2";
  let selq="where user_email like '"+search+"%'";

  if(search.length!=0)
    {
      query=query+" "+selq;
      
    }
  if(sort === "name"){
    query=query+" order by user_name";
   
  }
  else if(sort === "age"){
    query=query+" order by age";
   
  }
  else if(sort === "email"){
    query=query+" order by user_email";
   
  }
  

    query=query+" "+constraint;
  console.log(query)
  client.query(query, [limit, offset], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      // console.log({ msg: flag, data: result.rows });
      // console.log(result.rows.length + " " + currentPage);
      console.log(search)
      res.send({ msg: flag, data: result.rows });

    }
  });
});


app.post("/insert",upload.none(),(req, res) => {

const details=req.body;

const query="insert into employee values($1, $2, $3, $4);"
console.log(req.body);
client.query(query,[details.name,details.email,details.age,details.address],(err,result)=>{
  if(err)
  {
    console.log(err);
    res.send({msg:"failure"})
  }
  else{
    console.log(result.rowCount + " rows inserted successfully");
    res.send({msg:"success"});
  }
})
 
})

app.post("/delete", (req, res) => {
  const email=req.body.email;
  const query="delete from employee where user_email='"+email+"';";

  console.log(email);
  client.query(query,(err, result) => {

    if(err)
      {
        console.log(err);
        res.send({msg:"failure"})
      }
      else{
        console.log(result.rowCount + " rows deleted successfully");
        res.send({msg:"success"});
      }
  })

})
app.listen(3002, () => {
  console.log("Server is listening at port 3002");
});
