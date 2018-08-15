const http = require("http");
const fs = require("fs");

const buffer_split = (buffer, signeture) => {
  let splited_buffer = [];
  let start_pos;
  do{
    start_pos = buffer.indexOf(signeture);
    splited_buffer.push(buffer.slice(0, start_pos));
    buffer = buffer.slice(start_pos + signeture.length, buffer.length);
  }while(start_pos !== -1);

  return splited_buffer;
};

const parse_multipart = (buffer, boundary) => {
  const splited_buffer = buffer_split(buffer, boundary);
  return splited_buffer
    .slice(1, splited_buffer.length - 1)
    .map(x => {
      const signeture = "\r\n\r\n";
      const split_pos = x.indexOf(signeture);
      return {
        filename: x.slice(0, split_pos).toString().match(/filename="(.+?)"/)[1],
        data: x.slice(split_pos + signeture.length, x.length)
      };
    });
};

const server = http.createServer((req, res) => {
  if(req.method === "GET"){
    res.setHeader("Content-Type", "text.html");
    res.end(fs.readFileSync("index.html").toString());
  }else{
    res.setHeader("Content-Type", "text.html");
    res.end("ok");
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => {
      const boundary = req.headers["content-type"].match(/boundary=(.+)/)[1];
      const files = parse_multipart(Buffer.concat(chunks), boundary);
      fs.writeFileSync(files[0].filename, files[0].data);
    });
  }
});

server.listen(8080);

