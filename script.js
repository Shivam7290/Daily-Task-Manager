// Step 1 - Get all HTML elements by their ID
var taskInput      = document.getElementById("taskInput");
var prioritySelect = document.getElementById("prioritySelect");
var addBtn         = document.getElementById("addBtn");
var taskError      = document.getElementById("taskError");
var taskList       = document.getElementById("taskList");
var emptyState     = document.getElementById("emptyState");
var totalCount     = document.getElementById("totalCount");
var completedCount = document.getElementById("completedCount");
var pendingCount   = document.getElementById("pendingCount");
var filterBtns     = document.querySelectorAll(".btn-filter");
var editInput      = document.getElementById("editInput");
var editPriority   = document.getElementById("editPriority");
var editError      = document.getElementById("editError");
var editId         = document.getElementById("editId");
var saveEditBtn    = document.getElementById("saveEditBtn");

// Step 2 - Load saved tasks from localStorage
var tasks         = JSON.parse(localStorage.getItem("myTasks")) || [];
var currentFilter = "all";

// Step 3 - Save tasks array to localStorage
function saveToStorage() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Step 4 - Update the 3 counters (Total, Completed, Pending)
function updateCounters() {
  var completed = tasks.filter(function(task) {
    return task.completed;
  }).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  pendingCount.textContent = tasks.length - completed;
}

// Step 5 - Return a colored badge based on priority
function getPriorityBadge(priority) {
  if (priority === "high") {
    return '<span class="priority-badge badge-high">🔴 High</span>';
  } else if (priority === "medium") {
    return '<span class="priority-badge badge-medium">🟡 Medium</span>';
  } else {
    return '<span class="priority-badge badge-low">🟢 Low</span>';
  }
}

// Step 6 - Show all tasks on screen
function renderTasks() {
  var html  = "";
  var count = 0;

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    // Skip tasks that don't match the current filter
    if (currentFilter === "pending"   && task.completed === true)  continue;
    if (currentFilter === "completed" && task.completed === false) continue;

    var doneClass = task.completed ? "completed" : "";
    var checkMark = task.completed ? "checked"   : "";

    // data-id attribute is used to identify which task was clicked
    html += `
      <div class="task-item priority-${task.priority} ${doneClass}" id="task-${task.id}">
        <input type="checkbox" class="task-check" ${checkMark} data-id="${task.id}" />
        <span class="task-text">${task.text}</span>
        ${getPriorityBadge(task.priority)}
        <button class="btn-icon btn-edit"   data-id="${task.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="btn-icon btn-delete" data-id="${task.id}" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    `;

    count = count + 1;
  }

  if (count === 0) {
    taskList.innerHTML = "";
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
    taskList.innerHTML = html;
  }

  updateCounters();
}

// Step 7 - Add a new task
function addTask() {
  var text = taskInput.value.trim();

  if (text === "") {
    taskInput.classList.add("is-invalid");
    taskError.classList.remove("d-none");
    taskInput.focus();
    return;
  }

  taskInput.classList.remove("is-invalid");
  taskError.classList.add("d-none");

  var newTask = {
    id:        Date.now().toString(),
    text:      text,
    priority:  prioritySelect.value,
    completed: false
  };

  tasks.unshift(newTask);
  saveToStorage();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

// Step 8 - Toggle task complete / pending
function toggleComplete(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }
  saveToStorage();
  renderTasks();
}

// Step 9 - Delete a task
function deleteTask(id) {
  tasks = tasks.filter(function(task) {
    return task.id !== id;
  });

  saveToStorage();
  renderTasks();
}

// Step 10 - Open Edit modal
function openEditModal(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      editInput.value    = tasks[i].text;
      editPriority.value = tasks[i].priority;
      editId.value       = id;
      break;
    }
  }

  editInput.classList.remove("is-invalid");
  editError.classList.add("d-none");

  // Initialize modal here (not at page load) to avoid Bootstrap timing errors
  var modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

// Step 11 - Event delegation: handle clicks on task list buttons
// Instead of putting onclick on every button, we listen on the parent div
taskList.addEventListener("click", function(event) {
  var btn = event.target.closest("button");
  if (!btn) return;

  var id = btn.getAttribute("data-id");

  if (btn.classList.contains("btn-edit"))   openEditModal(id);
  if (btn.classList.contains("btn-delete")) deleteTask(id);
});

// Step 12 - Event delegation: handle checkbox changes
taskList.addEventListener("change", function(event) {
  if (event.target.classList.contains("task-check")) {
    var id = event.target.getAttribute("data-id");
    toggleComplete(id);
  }
});

// Step 13 - Save edited task
saveEditBtn.addEventListener("click", function() {
  var newText = editInput.value.trim();

  if (newText === "") {
    editInput.classList.add("is-invalid");
    editError.classList.remove("d-none");
    return;
  }

  editInput.classList.remove("is-invalid");
  editError.classList.add("d-none");

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === editId.value) {
      tasks[i].text     = newText;
      tasks[i].priority = editPriority.value;
      break;
    }
  }

  saveToStorage();
  renderTasks();

  // Close the modal using Bootstrap's data attribute approach
  var modalEl = document.getElementById("editModal");
  var modal   = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
});

// Step 14 - Filter buttons
for (var i = 0; i < filterBtns.length; i++) {
  filterBtns[i].addEventListener("click", function() {
    for (var j = 0; j < filterBtns.length; j++) {
      filterBtns[j].classList.remove("active");
    }
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    renderTasks();
  });
}

// Step 15 - Add task on Enter key press
taskInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") addTask();
});

// Step 16 - Add task on button click
addBtn.addEventListener("click", addTask);

// Step 17 - Clear error when user starts typing
taskInput.addEventListener("input", function() {
  if (taskInput.value.trim() !== "") {
    taskInput.classList.remove("is-invalid");
    taskError.classList.add("d-none");
  }
});

// Step 18 - Run on page load to show any saved tasks
renderTasks();
