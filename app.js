const express = require("express");
const querystring = require("querystring");
const connectDB = require("./config/db")
const Message = require('./models/Messages')
const port = 3000;
const app = express();

connectDB()
// List of all messages
let messages = [];

// Track last active times for each sender
let users = {};

app.use(express.static("./public"));
app.use(express.json());

// generic comparison function for case-insensitive alphabetic sorting on the name field
function userSortFn(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
}

app.get("/messages", async (request, response) => {
  // get the current time
  try {
    messages = await Message.find()
  } catch (error) {
    console.error(error.message)
  }

  const now = Date.now();

  // consider users active if they have connected (GET or POST) in last 15 seconds
  const requireActiveSince = now - 15 * 1000;

  // create a new list of users with a flag indicating whether they have been active recently
  usersSimple = Object.keys(users).map(x => ({
    name: x,
    active: users[x] > requireActiveSince
  }));

  // sort the list of users alphabetically by name
  usersSimple.sort(userSortFn);
  usersSimple.filter(a => a.name !== request.query.for);

  // update the requesting user's last access time
  users[request.query.for] = now;

  // send the latest 40 messages and the full user list, annotated with active flags
  response.send({ messages: messages.slice(-40), users: usersSimple });
});

app.post("/messages", async (request, response) => {
  // add a timestamp to each incoming message.
  console.log(request.body)
  const timestamp = Date.now();
  request.body.timestamp = timestamp;

  // append the new message to the message list

  // update the posting user's last access timestamp (so we know they are active)
  users[request.body.sender] = timestamp;
  await Message.create(request.body)

  // Send back the successful response.
  response.status(201);
  response.send(request.body);
});

app.listen(3000);
