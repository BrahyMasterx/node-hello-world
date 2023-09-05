const username = process.env.WEB_USERNAME || "admin";
const password = process.env.WEB_PASSWORD || "admin2023*";
const url = process.env.RENDER_EXTERNAL_URL;
const port = process.env.PORT || 10000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
var request = require("request");
var fs = require("fs");
const auth = require("basic-auth");

app.get("/", function (req, res) {
  res.status(200).send("Hello World from IBM Cloud Essentials!");
});

// page access password
app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Node"');
  return res.status(401).send();
});

//Get the system process table
app.get("/status", function (req, res) {
  let cmdStr = "pm2 list; ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>command line execution error：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>Get daemon and system process tables：\n" + stdout + "</pre>");
    }
  });
});

//Get the system listening port
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>command line execution error：\n" + err + "</pre>");
      } else {
        res.type("html").send("<pre>Get the system listening port：\n" + stdout + "</pre>");
      }
    });
  });

//Get node data
app.get("/list", function (req, res) {
    let cmdStr = "bash argo.sh";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>command line execution error：\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>node data：\n\n" + stdout + "</pre>");
      }
    });
  });

//Get system version, memory information
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("command line execution error：" + err);
    }
    else {
      res.send(
        "Command line execution result：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//System permission read-only test
app.get("/test", function (req, res) {
  let cmdStr = 'mount | grep " / " | grep "(ro," >/dev/null';
  exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      res.send("System permissions are --- non-read-only");
    } else {
      res.send("System permissions are --- read-only");
    }
  });
});

// keepalive begin
//web keep alive
function keep_web_alive() {
  // request home page, stay awake
  exec("curl -m8 " + url, function (err, stdout, stderr) {
    if (err) {
      console.log("Keep Alive Failed:" + err);
    }
    else {
      console.log("Keep Alive OK:" + stdout);
    }
  });
}

setInterval(keep_web_alive, 300 * 1000);

//Start the core script to run web, and argo
exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
