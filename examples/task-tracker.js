const { join } = require("path");
const { YeetServer } = require("../src/yeet-server");
const fs = require('fs');
const { fileURLToPath } = require("url");

const server = new YeetServer();
const filePath = join(process.cwd(), 'examples/tasks.json') 

function readTasks() {
  const rawdata = fs.readFileSync(filePath);
  return JSON.parse(rawdata.toString());
}

server.get("/tasks", () => {
  return {
    status: 200,
    body: JSON.stringify(readTasks()),
    headers: {"Content-Type": "application/json"}
  };
});

server.post("/tasks", (request) => {
  let tasks = readTasks();

  const data = JSON.parse(request.body);

  tasks.push(data);
  fs.writeFileSync(filePath, JSON.stringify(tasks));
  return {
    status: 201,
    body: `Task added`,
    headers: {"Content-Type": "text/plain"}
  };
});

server.put("/tasks/*", (request) => {
  let tasks = readTasks();
  
  const params = request.path.split('/').slice(1);

  let task = tasks.find(task => task.id === params[1]);

  if (!task) {
    return {
      status: 404,
      body: 'Task not found',
      headers: {"Content-Type": "text/plain"}
    };
  }

  const data = JSON.parse(request.body);

  task = {...task, ...data};
  
  tasks = tasks.map(it => {
    if(it.id === task.id) {
      return task;
    }
    return it;
  });

  fs.writeFileSync(filePath, JSON.stringify(tasks));

  return {
    status: 200,
    body: 'Task updated',
    headers: {"Content-Type": "text/plain"}
  };
});

server.delete("/tasks/*", (request) => {
  let tasks = readTasks();

  const params = request.path.split('/').slice(1);

  tasks = tasks.filter(task => task.id !== params[1]);
  
  fs.writeFileSync(filePath, JSON.stringify(tasks));

  return {
    status: 200,
    body: "Task deleted",
    headers: {"Content-Type": "text/plain"}
  };
});

server.listen(3000, "127.0.0.1");

