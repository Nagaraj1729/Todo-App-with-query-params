const express = require("express");
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async ()=> {
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        });
        app.listen(3000, ()=>{
            console.log("Server Running at http://localhost:3000/");
        });
    }catch(error){
        console.log(`DB Error - ${error.message}`);
        process.exit(1);
    };
};

initializeDBAndServer();

// 1.Get Todos by query_params API
app.get("/todos/", async (request, response) => {
    const { status = '',
            priority = '',
            search_q = ''
          } = request.query;
    console.log(request.query)
    const getTodosQuery = 
        `
            SELECT
                *
            FROM
                todo
            WHERE
                status LIKE '%${status}%'
                AND  priority LIKE '%${priority}%'
                AND  todo LIKE '%${search_q}%'  
                 
        `
    const dbTodos = await db.all(getTodosQuery);
    response.send(dbTodos);
});

// 2.Get Todo by Id API
app.get("/todos/:todoId/", async (request, response) => {
    const {todoId} = request.params;
    const getTodoByIdQuery = 
        `
            SELECT 
                *
            FROM
                todo
            WHERE
                id = ${todoId}
        `
    const todo = await db.get(getTodoByIdQuery);
    response.send(todo);
});


// 3.Add Todo API
app.post("/todos/", async (request, response)=> {
    const {id, todo, priority, status} = request.body;
    const addTodoQuery = 
        `
            INSERT INTO 
                todo (id, todo, priority, status)
            VALUES (
                ${id},
                '${todo}',
                '${priority}',
                '${status}'
            )
        `
    await db.run(addTodoQuery);
    response.send("Todo Successfully Added");
});

// 4.Update Todo API
app.put("/todos/:todoId/", async (request, response)=> {
   const todoData = request.body
   const [key] = Object.getOwnPropertyNames(todoData)
   const value = todoData[key];
   const updateTodoQuery = 
        `
            UPDATE 
                todo
            SET
               ${key} = '${value}' 
            
        `
    await db.run(updateTodoQuery);
    const property = key.slice(0,1).toUpperCase() + key.slice(1)
    response.send(`${property} Updated`);
});

// 5. Delete Todo API
app.delete("/todos/:todoId", async (request, response)=> {
    const { todoId } = request.params;
    const deleteTodoQuery = 
        `
            DELETE FROM
                todo
            WHERE
                id = ${todoId}
        `
    await db.run(deleteTodoQuery);
    response.send("Todo Deleted")
});


module.exports = app;