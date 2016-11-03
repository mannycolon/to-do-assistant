import { EventEmitter } from "events";
import dispatcher from "../dispatcher";
import fs from "fs-extra";
import readJSON from "utils-fs-read-json";
import path from 'path';


class ToDoStore extends EventEmitter {
  constructor() {
    super()
    this.appData = this.readData();
    //TODO:work on todos data
    this.todos = [];
    this.currentUser = null;
    this.currentToDoBook = null;
  }

  readData(){
    var file = './localStore/data.json';
    var data = readJSON.sync( file, 'utf8' );
    if(Array.isArray(data)){
      return data;
    }else{
      data = [];
    }
    return data;
  }

  saveData(){
    var file = './localStore/data.json';
    let data = this.appData;
    fs.outputJson(file, data, function (err) {
      err ? console.log(err) : console.log("saved succesfully");
      fs.readJson(file, function(err, data) {
      })
    })
  }

  getAll() {
    return this.todos;
  }

  getValidatedUsername(newUsername){
    //TODO:  NEEDS more TESTING
    let foundUsername;
    while(this.appData.length !== 0){
      foundUsername = this.appData.find(user => user.username === newUsername);
    }
    if(!newUsername){
      return ' Please enter an username.';
    }else if (foundUsername && foundUsername.username === newUsername) {
      return " This username already exists";
    }else{
      return null;
    }
  }

  createNewUsername(newUsername){
    //TODO:  NEEDS more TESTING
      let newUserNameObj = new Object();
      newUserNameObj.username = newUsername;
      //initiating the todoLists array
      newUserNameObj.todoLists = [];
      this.appData.push(newUserNameObj);
      this.setCurrentUserInStore(newUserNameObj.username);
      this.saveData();
      this.emit("newUser");
  }

  setCurrentUserInStore(username){
    this.currentUser = username;
    this.emit("currentUserUpdated");
  }

  getAllUserNames() {
    const foundAllUsernames = [];
    let dataArray = this.appData;
    for(var element in dataArray){
      foundAllUsernames.push(dataArray[element].username);
    }
    return foundAllUsernames;
  }

  getValidatedNewToDoBook(newToDoBookName){
    //TODO:  NEEDS  TESTING
    const foundUser;
    const foundToDoBookName;
      while(this.appData.length !== 0){
        foundUser = this.appData.find(users => users.username === this.currentUser);
        foundToDoBookName = foundUser.toDoLists.find(
          toDoListsElement => toDoListsElement.toDoListName === newToDoBookName
        );
      }
      if(!newToDoBookName){
        return ' Please enter a ToDoBook name.';
      }else if(foundToDoBookName && foundToDoBookName.toDoListName === newToDoBookName){
        return " This ToDoBook name already exists";
      }else{
        return null;
      }
  }

  createNewToDoBook(newToDoBookName){
    //TODO:  NEEDS  TESTING
    const foundUser = this.appData.find(users => users.username === this.currentUser);
    let newToDoListObj = new Object();
    newToDoListObj.toDoListName = newToDoBookName;
    newToDoListObj.tasks = [];
    foundUser.toDoLists.push(newToDoListObj);
    this.setCurrentToDoBook(newToDoListObj.toDoListName);
    this.saveData();
    this.emit("newTodoBook");
  }

  setCurrentToDoBook(currentToDoBook){
    this.currentToDoBook = currentToDoBook;
  }

  getAllToDoBooks(){
    const foundAllToDoBooks = [];
    const foundUser = this.appData.find(users => users.username === this.currentUser);
    const foundToDoLists = foundUser.toDoLists;
    for(var element in foundToDoLists){
      foundAllToDoBooks.push(foundToDoLists[element].toDoListName);
    }
    return foundAllToDoBooks;
  }

///////////////////// guide



////////////////////

  createTodo(task) {
    const id = Date.now();
    this.todos.push({
      id,
      task,
      isDone: false,
    });
    this.saveData();
    this.emit("change");
  }

  deleteTodo(idToDelete){
    const foundTodo = this.todos.find(todo => todo.id === idToDelete);
    this.todos.splice( this.todos.indexOf(foundTodo), 1 );
    this.saveData();
    this.emit("change");
  }

  completeTodo(id){
    //using the find() method to find the first element in
    //the array that satisfies the callback (es6 arrrow function)
    const foundTodo = this.todos.find(todo => todo.id === id);
    foundTodo.isDone = !foundTodo.isDone;
    this.saveData();
    this.emit("change");
  }

  editTodo(oldTask, newTask){
    const foundTodo = this.todos.find(todo => todo.task === oldTask);
    foundTodo.task = newTask;
    this.saveData();
    this.emit("change");
  }

  handleActions(action) {
    switch(action.type) {
      case "CREATE_TODO": {
        this.createTodo(action.task);
        break;
      }
      case "DELETE_TODO": {
        this.deleteTodo(action.id);
        break;
      }
      case "COMPLETE_TODO": {
        this.completeTodo(action.id);
        break;
      }
      case "EDIT_TODO": {
        this.editTodo(action.oldTask, action.newTask);
        break;
      }
      case "CREATE_NEWUSER": {
        this.createNewUsername(action.username);
        break;
      }
      //WILL PROBABLY REMOVE BELOW
      case "RECEIVE_TODOS": {
        this.todos = action.todos;
        this.emit("change");
        break;
      }
    }
  }

}

const todoStore = new ToDoStore;
dispatcher.register(todoStore.handleActions.bind(todoStore));

module.exports = todoStore;
